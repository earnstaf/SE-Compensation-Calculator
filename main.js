const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

let store;

async function initStore() {
  const { default: Store } = await import('electron-store');
  store = new Store({
    name: 'user-settings',
    defaults: {
      team: 'custom',
      ote: '',
      narrQuota: '',
      narrQuotaCredit: ''
    }
  });
}

ipcMain.handle('settings:load', () => store ? store.store : {});
ipcMain.handle('settings:save', (_event, data) => {
  if (!store) return;
  for (const [key, value] of Object.entries(data)) {
    store.set(key, value);
  }
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      preload: path.join(__dirname, 'preload.js')
    },
    title: 'Pre-Sales Compensation Calculator'
  });

  win.loadFile('index.html');

  win.webContents.on('will-navigate', (e) => e.preventDefault());
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
}

app.whenReady().then(async () => {
  await initStore();
  createWindow();

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('update-downloaded', (info) => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Update Available',
      message: `Version ${info.version} has been downloaded. Restart now to apply the update?`,
      buttons: ['Restart', 'Later']
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });

  autoUpdater.checkForUpdatesAndNotify().catch(() => {});
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('web-contents-created', (_event, contents) => {
  contents.on('will-attach-webview', (event) => {
    event.preventDefault();
  });
});
