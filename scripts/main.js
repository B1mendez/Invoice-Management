const { app, BrowserWindow } = require('electron');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1350,
    height: 775,
    icon: "./images/icons/win/invoisync_FpD_icon.ico", 
    webPreferences: {
      nodeIntegration: true
    }
  });

  mainWindow.loadFile('index.html');  // Load your main HTML file

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function() {
  if (mainWindow === null) {
    createWindow();
  }
});
