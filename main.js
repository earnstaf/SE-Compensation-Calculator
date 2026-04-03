const { app, BrowserWindow, Menu, dialog, shell, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

const isMac = process.platform === 'darwin';
const RELEASES_URL = 'https://github.com/earnstaf/SE-Compensation-Calculator/releases/latest';

let store;

async function initStore() {
  const { default: Store } = await import('electron-store');
  store = new Store({
    name: 'user-settings',
    defaults: {
      team: 'custom',
      ote: '',
      narrQuota: '',
      narrQuotaCredit: '',
      l3NarrQuota: '',
      l2NarrQuota: '',
      l3NarrQuotaCredit: '',
      l2NarrQuotaCredit: ''
    }
  });
}

const ALLOWED_SETTINGS = new Set(['team', 'ote', 'narrQuota', 'narrQuotaCredit', 'l3NarrQuota', 'l2NarrQuota', 'l3NarrQuotaCredit', 'l2NarrQuotaCredit', 'targetAttainment', 'newLogoPct', 'multiYearPct', 'totalRenewedArr', 'l3TargetAttainment', 'l2TargetAttainment']);

ipcMain.handle('settings:load', () => {
  const data = store ? Object.assign({}, store.store) : {};
  data._appVersion = app.getVersion();
  return data;
});
ipcMain.handle('settings:save', (_event, data) => {
  if (!store) return;
  for (const [key, value] of Object.entries(data)) {
    if (ALLOWED_SETTINGS.has(key) && typeof value === 'string') {
      store.set(key, value);
    }
  }
});

ipcMain.handle('pdf:generate', async (_event, htmlString, filenamePrefix) => {
  const pdfWin = new BrowserWindow({
    width: 800,
    height: 1100,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  pdfWin.webContents.on('will-navigate', (e) => e.preventDefault());
  pdfWin.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));

  try {
    await pdfWin.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(htmlString));
    await new Promise(resolve => setTimeout(resolve, 500));

    const pdfBuffer = await pdfWin.webContents.printToPDF({
      landscape: false,
      pageSize: 'Letter',
      printBackground: true,
      margins: { marginType: 'custom', top: 0.5, bottom: 0.5, left: 0.5, right: 0.5 }
    });

    const dateStr = new Date().toISOString().slice(0, 10);
    const prefix = filenamePrefix || 'Commission-Breakdown';
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Export PDF',
      defaultPath: path.join(app.getPath('downloads'), prefix + '-' + dateStr + '.pdf'),
      filters: [{ name: 'PDF', extensions: ['pdf'] }]
    });

    if (canceled || !filePath) {
      pdfWin.close();
      return { success: false, reason: 'cancelled' };
    }

    fs.writeFileSync(filePath, pdfBuffer);
    pdfWin.close();
    return { success: true, filePath: filePath };
  } catch (err) {
    pdfWin.close();
    console.error('PDF generation failed:', err);
    return { success: false, reason: err.message };
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

  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'"]
      }
    });
  });

  win.loadFile('index.html');

  win.webContents.on('will-navigate', (e) => e.preventDefault());
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
}

app.whenReady().then(async () => {
  const appVersion = app.getVersion();
  let manualUpdateCheck = false;

  // Configure and fire update check immediately — no dependencies on store or window
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('error', (err) => {
    console.error('Auto-updater error:', err);
    if (manualUpdateCheck) {
      manualUpdateCheck = false;
      dialog.showMessageBox({
        type: 'error',
        title: 'Update Check Failed',
        message: 'Unable to check for updates.',
        detail: err.message || 'Please check your internet connection and try again.'
      });
    }
  });

  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for update...');
  });

  autoUpdater.on('update-available', (info) => {
    manualUpdateCheck = false;
    console.log('Update available:', info.version);
    if (isMac) {
      dialog.showMessageBox({
        type: 'info',
        title: 'Update Available',
        message: `Version ${info.version} is available.`,
        detail: 'To update on macOS:\n\n'
          + '1. Click "Download" to open the releases page\n'
          + '2. Download the .dmg file\n'
          + '3. Open Terminal and run:\n'
          + '    xattr -cr ~/Downloads/Pre-Sales*.dmg\n'
          + '4. Open the .dmg and drag the app to Applications',
        buttons: ['Download', 'Skip']
      }).then((result) => {
        if (result.response === 0) {
          shell.openExternal(RELEASES_URL);
        }
      });
    } else {
      dialog.showMessageBox({
        type: 'info',
        title: 'Software Update',
        message: 'A new version of Pre-Sales Compensation Calculator is available!',
        detail: `Version ${info.version} is now available (you have ${appVersion}). Would you like to download it now?`,
        buttons: ['Install Update', 'Remind Me Later', 'Skip This Version'],
        defaultId: 0,
        cancelId: 2
      }).then((result) => {
        if (result.response === 0) {
          autoUpdater.downloadUpdate();
        }
      });
    }
  });

  autoUpdater.on('update-not-available', () => {
    console.log('No update available.');
    if (manualUpdateCheck) {
      manualUpdateCheck = false;
      dialog.showMessageBox({
        type: 'info',
        title: 'No Updates Available',
        message: `You're on the latest version.`,
        detail: `Pre-Sales Compensation Calculator ${appVersion} is currently the newest version available.`
      });
    }
  });

  autoUpdater.on('update-downloaded', (info) => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Update Ready',
      message: `Pre-Sales Compensation Calculator ${info.version} has been downloaded.`,
      detail: 'The update will be applied when you restart the application.',
      buttons: ['Restart Now', 'Later'],
      defaultId: 0
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });

  autoUpdater.checkForUpdates().catch(() => {});

  // Store init and window creation run after update check is fired (non-blocking)
  await initStore();
  createWindow();

  const aboutMessage = `Pre-Sales Compensation Calculator\n\nVersion: ${appVersion}\nAuthor: Eric Arnst`;

  function checkForUpdatesManually() {
    manualUpdateCheck = true;
    autoUpdater.checkForUpdates().catch((err) => {
      manualUpdateCheck = false;
      dialog.showMessageBox({
        type: 'error',
        title: 'Update Check Failed',
        message: 'Unable to check for updates.',
        detail: err.message || 'Please check your internet connection and try again.'
      });
    });
  }

  const menuTemplate = [
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { label: 'About', click: () => dialog.showMessageBox({ type: 'info', title: 'About', message: aboutMessage }) },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    {
      label: 'Help',
      submenu: [
        { label: 'Check for Updates...', click: checkForUpdatesManually },
        { type: 'separator' },
        { label: 'About', click: () => dialog.showMessageBox({ type: 'info', title: 'About', message: aboutMessage }) }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
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
