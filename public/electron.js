const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const serve = require('electron-serve');
const loadURL = serve({directory: 'build'});

let mainWindow;
function createWindow() {
	mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			contextIsolation: false,
			preload: path.join(__dirname, 'preload.js'),
		},
		// frame: false,
		transparent: true,
	});

	if (!app.isPackaged) {
		mainWindow.loadURL('http://localhost:3000');
	} else {
		loadURL(mainWindow);
	}

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

ipcMain.on('test', (event, arg) => {
	console.log(arg);
});

const Core = require('./classes/core');
const Main = async () => {
	const core = new Core();
	core.loop();
};
Main();
