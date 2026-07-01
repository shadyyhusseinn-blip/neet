const { app, BrowserWindow, ipcMain, dialog, Tray, Menu } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;

let mainWindow;
let tray;
let isQuitting = false;

// const gotTheLock = app.requestSingleInstanceLock();

// if (!gotTheLock) {
//   app.quit();
// } else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: "Shady Hussein Studio Manager",
    icon: path.join(__dirname, '../assets/app-icon.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      devTools: true // Enable DevTools in production
    },
    autoHideMenuBar: true,
    show: false,
  });

  if (isDev) {
    // Use VITE_PORT env var if set (handles Vite auto-reassigned ports)
    const devPort = process.env.VITE_PORT || process.env.PORT || 3003;
    const devUrl = `http://localhost:${devPort}`;
    console.log('Loading dev URL:', devUrl);
    mainWindow.loadURL(devUrl);
  } else {
    // In production, dist folder is in resources
    const distPath = path.join(process.resourcesPath, 'dist', 'index.html');
    console.log('Loading production file:', distPath);
    console.log('process.resourcesPath:', process.resourcesPath);
    console.log('__dirname:', __dirname);
    
    mainWindow.loadFile(distPath).catch(err => {
      console.error('Failed to load file:', err);
      // Try asar path
      const asarPath = path.join(__dirname, '../dist/index.html');
      console.log('Trying asar path:', asarPath);
      mainWindow.loadFile(asarPath).catch(err2 => {
        console.error('Failed to load asar file:', err2);
        dialog.showErrorBox('Error', 'Cannot find index.html file');
      });
    });
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize();
    mainWindow.show();
  });

  // Intercept close to hide instead of quit (Discord style)
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  try {
    const iconPath = path.join(__dirname, '../assets/app-icon.ico');
    console.log('Tray icon path:', iconPath);
    console.log('Icon exists:', require('fs').existsSync(iconPath));
    tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
      { label: 'افتح مدير الاستوديو', click: () => mainWindow.show() },
      { type: 'separator' },
      { label: 'إغلاق', click: () => {
          isQuitting = true;
          app.quit();
        }
      }
    ]);
    tray.setToolTip('شادي حسين - مدير الاستوديو');
    tray.setContextMenu(contextMenu);
    tray.on('double-click', () => mainWindow.show());
  } catch (error) {
    console.error('Failed to create tray:', error);
  }
}

app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
});

// IPC Handlers for Settings
ipcMain.on('set-startup', (event, shouldStart) => {
  app.setLoginItemSettings({
    openAtLogin: shouldStart,
    path: app.getPath('exe'),
    args: ['--hidden']
  });
});

ipcMain.handle('get-startup', () => {
  const settings = app.getLoginItemSettings();
  return settings.openAtLogin;
});

ipcMain.handle('show-message-box', async (event, options) => {
  return await dialog.showMessageBox(mainWindow, options);
});
// }
