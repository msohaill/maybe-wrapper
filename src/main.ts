import { app, BrowserWindow, ipcMain } from 'electron';
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

const createWindow = async () => {
  // Create the browser window.
  const window = new BrowserWindow({
    height: 750,
    width: 1250,
    show: false,
    center: true,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 15, y: 15 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true,
    },
  });

  window.on('ready-to-show', window.show);

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    await window.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    await window.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  return window;
};

app.whenReady().then(async () => {
  ipcMain.handle('check', async () => initialized);

  const window = await createWindow();
  await startMaybe();

  window.webContents.send('start');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('will-quit', async e => {
  e.preventDefault();
  await stopMaybe();
  app.exit();
});
