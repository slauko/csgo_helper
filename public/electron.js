const {app, BrowserWindow, ipcMain} = require('electron');
const {overlayWindow} = require('electron-overlay-window');
const path = require('path');
const serve = require('electron-serve');
const loadURL = serve({directory: 'build'});

let mainWindow;
function createWindow() {
	mainWindow = new BrowserWindow({
		webPreferences: {
			contextIsolation: false,
			preload: path.join(__dirname, 'preload.js'),
		},
		...overlayWindow.WINDOW_OPTS,
	});
	if (!app.isPackaged) {
		mainWindow.loadURL('http://localhost:3000');
		mainWindow.webContents.openDevTools({
			mode: 'detach',
		});
	} else {
		loadURL(mainWindow);
	}
	mainWindow.setIgnoreMouseEvents(true);
	overlayWindow.attachTo(mainWindow, 'Counter-Strike: Global Offensive - Direct3D 9');

	mainWindow.on('closed', () => {
		mainWindow = null;
	});
	mainWindow.once('ready-to-show', () => {
		mainWindow.show();
	});
}

app.on('ready', createWindow);
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

const {Settings, SaveSettings, LoadSettings} = require('./classes/settings');
ipcMain.handle('load-settings', async (event, arg) => {
	return await LoadSettings();
});
ipcMain.handle('save-settings', async (event, arg) => {
	SaveSettings(arg);
});

const Core = require('./classes/core');
const core = new Core(Settings);
core.loop();
