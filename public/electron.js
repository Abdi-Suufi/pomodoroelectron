const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = !app.isPackaged;
const dataPath = path.join(app.getPath('userData'), 'data.json');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 680,
    minWidth: 900,
    minHeight: 680,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => (mainWindow = null));
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Data handling
function loadData() {
  try {
    if (fs.existsSync(dataPath)) {
      return JSON.parse(fs.readFileSync(dataPath));
    }
    return { tasks: [], settings: { workTime: 25, breakTime: 5, longBreakTime: 15 }, reports: [] };
  } catch (error) {
    console.error('Failed to load data:', error);
    return { tasks: [], settings: { workTime: 25, breakTime: 5, longBreakTime: 15 }, reports: [] };
  }
}

function saveData(data) {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to save data:', error);
    return false;
  }
}

// IPC Communications
ipcMain.handle('get-data', () => loadData());
ipcMain.handle('save-data', (event, data) => saveData(data));

ipcMain.on('set-timer-notification', (event, message) => {
  new Notification({
    title: 'Pomodoro Timer',
    body: message
  }).show();
});