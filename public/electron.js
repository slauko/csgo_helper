// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } = require('electron');
const { overlayWindow } = require('electron-overlay-window');
const fetch = require('electron-fetch').default;
const memory = require('memoryjs');
const aks = require('asynckeystate');

const serve = require('electron-serve');
const loadURL = serve({
	directory: 'build',
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
function isDev() {
	return !app.isPackaged;
}

function createWindow() {
	let iconPath = path.join(__dirname, 'icon.ico');
	// Create the browser window.
	mainWindow = new BrowserWindow({
		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true,
			contextIsolation: false,
		},
		icon: iconPath,
		...overlayWindow.WINDOW_OPTS,
	});
	if (isDev()) {
		mainWindow.loadURL('http://localhost:3000/');
		mainWindow.webContents.openDevTools({
			mode: 'detach',
		});
	} else {
		loadURL(mainWindow);
	}
	mainWindow.setIgnoreMouseEvents(true, {
		forward: true,
	});
	overlayWindow.attachTo(mainWindow, 'Counter-Strike: Global Offensive - Direct3D 9');

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

	start();
}

const getGameProcessAndModules = async () => {
	let process = null;
	try {
		process = memory.openProcess('csgo.exe');
	} catch (e) {
		console.log('cant find game process!');
		await new Promise((r) => setTimeout(r, 1000));
		return await getGameProcessAndModules();
	}
	let client = null;
	try {
		client = memory.findModule('client.dll', process.th32ProcessID);
	} catch (e) {
		console.log('cant find client module!');
		await new Promise((r) => setTimeout(r, 1000));
		return await getGameProcessAndModules();
	}
	let engine = null;
	try {
		engine = memory.findModule('engine.dll', process.th32ProcessID);
	} catch (e) {
		console.log('cant find engine module!');
		await new Promise((r) => setTimeout(r, 1000));
		return await getGameProcessAndModules();
	}

	return { process: process, client: client, engine: engine };
};

const initGame = async () => {
	let newGame = await getGameProcessAndModules();
	await fetch('https://raw.githubusercontent.com/frk1/hazedumper/master/csgo.json')
		.then((res) => {
			return res.json();
		})
		.then((data) => {
			newGame = { ...newGame, offsets: data };
		});
	return newGame;
};
const isGameRunning = () => {
	const processes = memory.getProcesses();
	for (let index = 0; index < processes.length; index++) {
		const process = processes[index];
		if (process.szExeFile == 'csgo.exe') {
			return true;
		}
	}
	return false;
};

let game = {};
let menu = false;

let viewMatrix = [];
let localPlayer = {};
let enemies = [];
let entities = [];

//default settings placeholder
let settings = {
	aim: {
		fov: 3,
		smooth: 3,
		bone: { value: 8, label: 'HEAD' },
		aimkey: { value: 1, label: 'MB1' },
		triggerkey: { value: 5, label: 'MX2' },
	},
	esp: { lines: false, health: true, ammo: false, boxes: true, armor: true, weapons: false },
	misc: {
		menuPosition: { x: 100, y: 100 },
	},
};

const fs = require('fs');
const { mouse } = require('@nut-tree/nut-js');
const path = require('path');

const saveSettings = (current) => {
	settings = current;
	fs.writeFileSync('settings.json', JSON.stringify(settings));
};

const loadSettings = () => {
	const path = 'settings.json';
	if (fs.existsSync(path)) {
		// if settings.json already exists load it from disk
		settings = JSON.parse(fs.readFileSync(path, 'utf-8'));
		return settings;
	} else {
		// if no settings.json exist yet just return default values
		return settings;
	}
};

const checkMenuKeyPressed = async () => {
	if (aks.getAsyncKeyState(aks.codes.vk_Delete)) {
		menu = !menu;
		mainWindow.webContents.send('openmenu', menu);
		if (menu) {
			mainWindow.setIgnoreMouseEvents(false);
		} else {
			mainWindow.setIgnoreMouseEvents(true, {
				forward: true,
			});
		}
		await new Promise((r) => setTimeout(r, 100));
		return true;
	}
	return false;
};

const getViewMatrix = () => {
	let viewMatrixBuffer = memory.readBuffer(
		game.process.handle,
		game.client.modBaseAddr + game.offsets.signatures.dwViewMatrix,
		64
	);
	let newViewMatrix = [];
	for (let index = 0; index < 16; index++) {
		newViewMatrix[index] = viewMatrixBuffer.readFloatLE(index * 4);
	}
	return newViewMatrix;
};

const getEntityList = () => {
	let playerCount = 60; // TODO: read it dynamically
	let entityAddressBuffer = memory.readBuffer(
		game.process.handle,
		game.client.modBaseAddr + game.offsets.signatures.dwEntityList,
		playerCount * 0x10
	);

	let newEntityList = [];
	for (let index = 0; index < playerCount; index++) {
		let entity = null;
		let entityAddress = entityAddressBuffer.readUInt32LE(index * 0x10);
		if (entityAddress) {
			let entityBuffer = memory.readBuffer(game.process.handle, entityAddress, 75000);
			entity = {
				team: entityBuffer.readUInt32LE(game.offsets.netvars.m_iTeamNum),
				armor: entityBuffer.readUInt32LE(game.offsets.netvars.m_ArmorValue),
				health: entityBuffer.readUInt32LE(game.offsets.netvars.m_iHealth),
				dormant: entityBuffer.readUInt8(game.offsets.signatures.m_bDormant),
				aimPunch: {
					x: entityBuffer.readFloatLE(game.offsets.netvars.m_aimPunchAngle),
					y: entityBuffer.readFloatLE(game.offsets.netvars.m_aimPunchAngle + 4),
				},
				position: {
					x: entityBuffer.readFloatLE(game.offsets.netvars.m_vecOrigin),
					y: entityBuffer.readFloatLE(game.offsets.netvars.m_vecOrigin + 4),
					z: entityBuffer.readFloatLE(game.offsets.netvars.m_vecOrigin + 8),
				},
				viewOffset: entityBuffer.readFloatLE(game.offsets.netvars.m_vecViewOffset + 8),
				crosshairID: entityBuffer.readUInt32LE(game.offsets.netvars.m_iCrosshairId),
				FOV:
					entityBuffer.readUInt32LE(game.offsets.netvars.m_iFOV) ||
					entityBuffer.readUInt32LE(game.offsets.netvars.m_iFOVStart),
			};
			entity.bonePos = [];
			entity.bonePosScreen = [];
			let boneBase = entityBuffer.readUInt32LE(game.offsets.netvars.m_dwBoneMatrix);
			let boneBuffer = memory.readBuffer(game.process.handle, boneBase, 1000);
			for (let boneid = 0; boneid < 12; boneid++) {
				entity.bonePos[boneid] = {
					x: boneBuffer.readFloatLE(0x30 * boneid + 0x0c),
					y: boneBuffer.readFloatLE(0x30 * boneid + 0x1c),
					z: boneBuffer.readFloatLE(0x30 * boneid + 0x2c),
				};
			}
			for (let boneid = 0; boneid < 12; boneid++) {
				entity.bonePosScreen[boneid] = worldToScreen(entity.bonePos[boneid], viewMatrix);
			}

			entity.screenPos = worldToScreen(entity.position, viewMatrix);
			entity.screenHeadPos = entity.bonePosScreen[8];
		}
		newEntityList[index] = entity;
	}

	return newEntityList;
};

let clientState = 0;
const getLocalPlayer = () => {
	clientState = memory.readMemory(
		game.process.handle,
		game.engine.modBaseAddr + game.offsets.signatures.dwClientState,
		memory.DWORD
	);
	let localPlayerIndex = memory.readMemory(
		game.process.handle,
		clientState + game.offsets.signatures.dwClientState_GetLocalPlayer,
		memory.DWORD
	);

	let localplayer = entities[localPlayerIndex];
	if (localplayer) {
		localplayer.viewAngles = memory.readMemory(
			game.process.handle,
			clientState + game.offsets.signatures.dwClientState_ViewAngles,
			memory.VECTOR3
		);
	}
	return localplayer;
};

const worldToScreen = (worldPos, viewMatrix) => {
	let screenPos = {};
	let w = 0.0;
	screenPos.x =
		viewMatrix[0] * worldPos.x +
		viewMatrix[1] * worldPos.y +
		viewMatrix[2] * worldPos.z +
		viewMatrix[3];
	screenPos.y =
		viewMatrix[4] * worldPos.x +
		viewMatrix[5] * worldPos.y +
		viewMatrix[6] * worldPos.z +
		viewMatrix[7];

	w =
		viewMatrix[12] * worldPos.x +
		viewMatrix[13] * worldPos.y +
		viewMatrix[14] * worldPos.z +
		viewMatrix[15];
	if (w < 0.01) {
		return false;
	}
	let invw = 1.0 / w;

	screenPos.x *= invw;
	screenPos.y *= invw;

	let bounds = mainWindow.getBounds();

	let width = bounds.width;
	let height = bounds.height;
	let x = width / 2;
	let y = height / 2;
	x += 0.5 * screenPos.x * width + 0.5;
	y -= 0.5 * screenPos.y * height + 0.5;
	screenPos.x = x + bounds.x;
	screenPos.y = y + bounds.y;
	return screenPos;
};

const render = async (enemies) => {
	mainWindow.webContents.send('draw', enemies);
};

const calcAimAngle = (src, dst) => {
	const substract = (src, dst) => {
		let diff = {};
		diff.x = src.x - dst.x;
		diff.y = src.y - dst.y;
		diff.z = src.z - dst.z;
		return diff;
	};
	const magnitude = (vec) => {
		return Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
	};

	let angles = {};
	let delta = substract(src, dst);
	let hyp = magnitude(substract(src, dst));
	angles.x = (Math.atan(delta.z / hyp) * 180.0) / Math.PI;
	angles.y = (Math.atan(delta.y / delta.x) * 180.0) / Math.PI;
	angles.z = 0.0;
	if (delta.x >= 0.0) {
		angles.y = angles.y + 180.0;
	}
	if (angles.x <= -89) {
		angles.x = angles.x + 180;
	}
	if (angles.x >= 89) {
		angles.x = angles.x - 180;
	}
	if (angles.y <= -180) {
		angles.y = angles.y + 360;
	}
	if (angles.y >= 180) {
		angles.y = angles.y - 360;
	}
	return angles;
};

const getViewAngleDistance = (view, angle) => {
	let x = Math.abs(view.x - angle.x) / 2;
	let y = Math.abs(view.y - angle.y);
	if (y > 180) {
		y = 360 - y;
	}
	return x + y;
};

const getClosestAngle = (view, angles) => {
	let dists = [];
	angles.forEach((angle) => {
		let distance = getViewAngleDistance(view, angle);
		dists.push(distance);
	});
	let shortestDist = Math.min(...dists);
	let shortestIndex = dists.indexOf(shortestDist);
	return angles[shortestIndex];
};
const aimbot = async () => {
	while (game.process) {
		if (!localPlayer) {
			await new Promise((r) => setTimeout(r, 100));
			continue;
		}

		let view = localPlayer.viewAngles;
		if (view) {
			let aimAngles = [];
			enemies.forEach((enemy) => {
				let aimPos = enemy.bonePos[settings.aim.bone.value];
				let plaPos = {
					x: localPlayer.position.x,
					y: localPlayer.position.y,
					z: localPlayer.position.z + localPlayer.viewOffset,
				};

				let angle = calcAimAngle(plaPos, aimPos);
				aimAngles.push(angle);
			});
			let closestRaw = getClosestAngle(view, aimAngles);
			if (aks.getAsyncKeyState(settings.aim.aimkey.value) && closestRaw && !menu) {
				let closest = {
					x: closestRaw.x - localPlayer.aimPunch.x * 2,
					y: closestRaw.y - localPlayer.aimPunch.y * 2,
					z: 0,
				};
				let distance = getViewAngleDistance(view, closest);
				if (distance <= settings.aim.fov) {
					let smooth = settings.aim.smooth;
					let diff = { x: closest.x - view.x, y: closest.y - view.y };
					if (diff.x <= -89) {
						diff.x = diff.x + 180;
					}
					if (diff.x >= 89) {
						diff.x = diff.x - 180;
					}
					if (diff.y <= -180) {
						diff.y = diff.y + 360;
					}
					if (diff.y >= 180) {
						diff.y = diff.y - 360;
					}

					let smoothFactor = { x: diff.x / smooth, y: diff.y / smooth };
					let smoothAngle = { x: view.x + smoothFactor.x, y: view.y + smoothFactor.y, z: 0 };
					memory.writeMemory(
						game.process.handle,
						clientState + game.offsets.signatures.dwClientState_ViewAngles,
						smoothAngle,
						memory.VECTOR3
					);
				}
			}
		}
		await new Promise((r) => setTimeout(r, 10));
	}
};

const triggerbot = async () => {
	while (game.process) {
		if (!localPlayer) {
			await new Promise((r) => setTimeout(r, 100));
			continue;
		}

		let cross = localPlayer.crosshairID;
		let target = entities[cross - 1];

		if (
			aks.getAsyncKeyState(settings.aim.triggerkey.value) &&
			target &&
			target.team !== localPlayer.team &&
			!menu
		) {
			memory.writeMemory(
				game.process.handle,
				game.client.modBaseAddr + game.offsets.signatures.dwForceAttack,
				5,
				memory.BYTE
			);
			await new Promise((r) => setTimeout(r, 10));
			memory.writeMemory(
				game.process.handle,
				game.client.modBaseAddr + game.offsets.signatures.dwForceAttack,
				4,
				memory.BYTE
			);
		}
		await new Promise((r) => setTimeout(r, 10));
	}
};

const start = async () => {
	game = await initGame();

	aimbot();
	triggerbot();

	while (isGameRunning()) {
		await checkMenuKeyPressed();
		viewMatrix = getViewMatrix();
		entities = getEntityList();
		localPlayer = getLocalPlayer();

		newEnemies = [];
		if (localPlayer) {
			for (let index = 0; index < entities.length; index++) {
				const entity = entities[index];
				if (
					entity &&
					entity.team != localPlayer.team &&
					entity.health > 0 &&
					entity.dormant === 0
				) {
					newEnemies.push(entity);
				}
			}
		}
		enemies = newEnemies;

		render(enemies);
		await new Promise((r) => setTimeout(r, 2));
	}

	game = {};
	start();
};

app.on('ready', createWindow);
app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') app.quit();
});
app.on('activate', function () {
	if (mainWindow === null) createWindow();
});

ipcMain.on('loadsettings', (event) => {
	//load settings from file here and return it to menu
	event.returnValue = loadSettings();
});

ipcMain.on('savesettings', (event, current) => {
	//save settings to file here
	saveSettings(current);
	event.returnValue = 'saved';
});
