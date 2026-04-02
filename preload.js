const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('appSettings', {
  load: () => ipcRenderer.invoke('settings:load'),
  save: (data) => ipcRenderer.invoke('settings:save', data)
});
