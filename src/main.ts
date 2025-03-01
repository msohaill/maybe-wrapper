import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import { execFile } from 'node:child_process';

let dockerRunning = false;
let initialized = false;

const resourcePath = app.isPackaged ? path.join(process.resourcesPath, 'maybe-docker') : path.join(__dirname, '../../maybe-docker');
const startScript = path.join(resourcePath, 'start.sh');
const stopScript = path.join(resourcePath, 'stop.sh');

const startMaybe = async () => {
  try {
    const out = await new Promise((resolve, reject) => execFile(startScript, (error, stdout) => {
      if (error) reject(error);
      else resolve(stdout);
    }));

    dockerRunning = out.toString().includes("Docker daemon is already running");
    initialized = true;
  } catch (error) {
    console.error(error);
  }
}

const stopMaybe = async () => {
  try {
    await new Promise((resolve, reject) => execFile(stopScript, [(!dockerRunning).toString()], (error, stdout) => {
      if (error) reject(error);
      else resolve(stdout);
    }));

    initialized = false;
  } catch (error) {
    console.error(error);
  }
}

const createWindow = () => {
  // Create the browser window.
  const window = new BrowserWindow({
    height: 700,
    width: 1000,
    show: false,
    frame: false,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 15, y: 15 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  window.on('ready-to-show', window.show);
  return window;
};

const loadIndex = async (window: BrowserWindow) => {
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    await window.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    await window.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }
}

const loadMaybe = async (window: BrowserWindow) => {
  await window.loadURL('http://localhost:3000');
}

app.whenReady().then(async () => {
  const window = createWindow();

  await loadIndex(window);
  await startMaybe();
  loadMaybe(window);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    const window = createWindow();

    if (initialized) loadMaybe(window);
    else loadIndex(window);
  }
});

app.on('will-quit', async e => {
  e.preventDefault();
  await stopMaybe();
  app.exit();
});
