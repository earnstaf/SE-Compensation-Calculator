const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('appSettings', {
  load: () => ipcRenderer.invoke('settings:load'),
  save: (data) => ipcRenderer.invoke('settings:save', data)
});

contextBridge.exposeInMainWorld('pdfExport', {
  generate: (htmlString, filenamePrefix) => ipcRenderer.invoke('pdf:generate', htmlString, filenamePrefix)
});
