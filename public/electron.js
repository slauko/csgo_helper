const {app, BrowserWindow, ipcMain, Tray, Menu, dialog} = require('electron');
const {overlayWindow} = require('electron-overlay-window');
const path = require('path');
const serve = require('electron-serve');
const loadURL = serve({directory: 'build'});
app.commandLine.appendSwitch('force-device-scale-factor', '1');

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

	let iconPath = path.join(__dirname, 'icon.ico');
	let appIcon = new Tray(iconPath);
	appIcon.setToolTip('csgo-helper');
	let contextMenu = Menu.buildFromTemplate([
		{
			label: 'Quit',
			click: function () {
				app.isQuiting = true;
				app.quit();
			},
		},
	]);
	appIcon.setContextMenu(contextMenu);
	mainWindow.on('closed', () => {
		mainWindow = null;
	});
}

let menu_active = false;
const {get_entity_list, get_local_player_index} = require('./modules/entity');
const {get_drawings} = require('./modules/drawings');
const {get_view_matrix} = require('./modules/viewmatrix');
const {GetAsyncKeyState} = require('./modules/windowsfunctions');

let settings = null;
let aim_active = false;
let trigger_active = false;
const {aimbot, triggerbot} = require('./modules/hacks');
ipcMain.handle('update', async () => {
	const bounds = mainWindow.getBounds();
	const entity_list = await get_entity_list();
	const local_index = await get_local_player_index();
	const view_matrix = await get_view_matrix();
	const local_player = entity_list[local_index];

	// DEL KEY
	if (GetAsyncKeyState(0x2e) & 1) {
		mainWindow.setIgnoreMouseEvents(menu_active);
		menu_active = !menu_active;
		mainWindow.webContents.send('toggle-menu', menu_active);
	}

	if (settings) {
		// AIM KEY
		if (GetAsyncKeyState(settings.aimkey) && !aim_active) {
			aim_active = true;
			aimbot(entity_list, local_player, settings, view_matrix, bounds).then(() => {
				aim_active = false;
			});
		}

		// TRIGGER KEY
		if (GetAsyncKeyState(settings.triggerkey) && !trigger_active) {
			trigger_active = true;
			triggerbot(entity_list, local_player).then(() => {
				trigger_active = false;
			});
		}
	}

	return await get_drawings(entity_list, local_player, view_matrix, bounds);
});

const {readFileSync, writeFileSync} = require('fs');
ipcMain.handle('load-settings', async (event) => {
	const settings_path = 'settings.json';
	try {
		const settings_text = readFileSync(settings_path);
		settings = JSON.parse(settings_text);
		return settings;
	} catch (error) {
		return null;
	}
});
ipcMain.handle('save-settings', async (event, settings_json) => {
	settings = settings_json;
	const settings_path = 'settings.json';
	const settings_text = JSON.stringify(settings_json, null, 2);
	await writeFileSync(settings_path, settings_text);
});

const {autoUpdater} = require('electron-updater');
autoUpdater.on('update-downloaded', () => {
	if (process.env.NODE_ENV === 'production') {
		autoUpdater.quitAndInstall(true, true);
	}
});

app.on('ready', () => {
	autoUpdater.checkForUpdates();
	createWindow();
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});
