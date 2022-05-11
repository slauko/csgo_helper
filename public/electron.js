const {app, BrowserWindow, ipcMain} = require('electron');
const {overlayWindow} = require('electron-overlay-window');
const path = require('path');
const serve = require('electron-serve');
const loadURL = serve({directory: 'build'});

const Core = require('./classes/core');
const {Settings, SaveSettings, LoadSettings} = require('./classes/settings');

let mainWindow;
function createWindow() {
	mainWindow = new BrowserWindow({
		webPreferences: {
			contextIsolation: false,
			preload: path.join(__dirname, 'preload.js'),
		},
		...overlayWindow.WINDOW_OPTS,
	});
	mainWindow.maximize();
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

	const core = new Core(Settings, mainWindow);
	core.loop();
}

app.on('ready', createWindow);
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

ipcMain.handle('load-settings', async (event, arg) => {
	return await LoadSettings();
});
ipcMain.handle('save-settings', async (event, arg) => {
	SaveSettings(arg);
});
ipcMain.handle('toggle-menu', async (event, arg) => {
	mainWindow.setIgnoreMouseEvents(arg);
});
