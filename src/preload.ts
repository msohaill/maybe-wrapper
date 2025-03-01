import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  onStart: (callback: () => void) => ipcRenderer.on('start', callback),
  started: (): Promise<boolean> => ipcRenderer.invoke('check')
});
