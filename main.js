const { app, BrowserWindow, Menu, dialog } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1800,
    height: 1400,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // This disables CORS
      allowRunningInsecureContent: true
    },
    show: false // Don't show until ready
  });

  // Load your index.html file from v2 directory
  mainWindow.loadFile(path.join(__dirname, 'v2', 'index.html'))
    .catch(err => {
      console.error('Failed to load index.html:', err);
      // Show error dialog if file fails to load
      dialog.showErrorBox('Error Loading App', 
        `Failed to load the application:\n${err.message}\n\nPath: ${path.join(__dirname, 'v2', 'index.html')}`
      );
    });

  // Show window when ready to prevent white flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Initialize auto-updater after app is running
    initializeAutoUpdater();
  });

  // Open DevTools in development to debug issues
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Initialize auto-updater separately to avoid startup issues
function initializeAutoUpdater() {
  try {
    const { autoUpdater } = require('electron-updater');
    
    // Configure auto-updater for public GitHub releases
    autoUpdater.setFeedURL({
      provider: 'github',
      owner: 'dadisimo',
      repo: 'csv-matcher-app',
      private: false
    });

    // Set update check interval to every 24 hours
    autoUpdater.autoDownload = false; // Don't auto-download, ask user first

    // Auto-updater events
    autoUpdater.on('checking-for-update', () => {
      console.log('Checking for update...');
    });

    autoUpdater.on('update-available', (info) => {
      console.log('Update available.');
      if (mainWindow && !mainWindow.isDestroyed()) {
        dialog.showMessageBox(mainWindow, {
          type: 'info',
          title: 'Update Available',
          message: `A new version (${info.version}) is available. Would you like to download it?`,
          buttons: ['Download', 'Later']
        }).then((result) => {
          if (result.response === 0) {
            autoUpdater.downloadUpdate();
          }
        }).catch(console.error);
      }
    });

    autoUpdater.on('update-not-available', (info) => {
      console.log('Update not available.');
    });

    autoUpdater.on('error', (err) => {
      console.log('Error in auto-updater:', err.message);
    });

    autoUpdater.on('download-progress', (progressObj) => {
      let log_message = "Download speed: " + progressObj.bytesPerSecond;
      log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
      log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
      console.log(log_message);
    });

    autoUpdater.on('update-downloaded', (info) => {
      console.log('Update downloaded');
      if (mainWindow && !mainWindow.isDestroyed()) {
        dialog.showMessageBox(mainWindow, {
          type: 'info',
          title: 'Update Ready',
          message: 'Update has been downloaded. The application will restart to apply the update.',
          buttons: ['Restart Now', 'Later']
        }).then((result) => {
          if (result.response === 0) {
            autoUpdater.quitAndInstall();
          }
        }).catch(console.error);
      }
    });
    
    // Only check for updates after a delay to ensure app is stable
    setTimeout(() => {
      autoUpdater.checkForUpdatesAndNotify();
    }, 5000);
  } catch (error) {
    console.log('Auto-updater not available:', error.message);
    // App continues to work without auto-updater
  }
}

app.whenReady().then(() => {
  createWindow();
  
  // Create application menu with Edit menu for copy/paste support
  const isMac = process.platform === 'darwin';
  
  const template = [
    // App menu (macOS only)
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        {
          label: 'Check for Updates',
          click: () => {
            try {
              const { autoUpdater } = require('electron-updater');
              autoUpdater.checkForUpdatesAndNotify();
            } catch (error) {
              dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: 'Auto-updater Not Available',
                message: 'Please check for updates manually on GitHub.',
                buttons: ['OK']
              });
            }
          }
        },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    
    // File menu
    {
      label: 'File',
      submenu: [
        ...(!isMac ? [{
          label: 'Check for Updates',
          click: () => {
            try {
              const { autoUpdater } = require('electron-updater');
              autoUpdater.checkForUpdatesAndNotify();
            } catch (error) {
              dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: 'Auto-updater Not Available',
                message: 'Please check for updates manually on GitHub.',
                buttons: ['OK']
              });
            }
          }
        }] : []),
        ...(!isMac ? [{ type: 'separator' }] : []),
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    
    // Edit menu - IMPORTANT for copy/paste!
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' },
        ...(isMac ? [
          { type: 'separator' },
          {
            label: 'Speech',
            submenu: [
              { role: 'startSpeaking' },
              { role: 'stopSpeaking' }
            ]
          }
        ] : [])
      ]
    },
    
    // View menu
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    
    // Window menu
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac ? [
          { type: 'separator' },
          { role: 'front' },
          { type: 'separator' },
          { role: 'window' }
        ] : [
          { role: 'close' }
        ])
      ]
    }
  ];
  
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}).catch(error => {
  console.error('Failed to initialize app:', error);
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