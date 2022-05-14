const ffi = require('ffi-napi');
const Process = require('./process');
const GameObjectManager = require('./game/gameobjectmanager');
const {update_view_matrix, get_view_matrix} = require('./game/viewmatrix');

const user32 = ffi.Library('user32', {
	GetAsyncKeyState: ['int', ['int']],
	GetCursorPos: ['int', ['pointer']],
	GetSystemMetrics: ['int', ['int']],
	SendInput: ['int', ['int', 'pointer', 'int']],
});

class Core {
	constructor(Settings, Overlay) {
		this.process = null;
		this.game_object_manager = null;
		this.settings = Settings;
		this.overlay = Overlay;
	}
	async init() {
		this.process = new Process('Counter-Strike: Global Offensive - Direct3D 9', 'csgo.exe', this.overlay);
		await this.process.init();
		this.game_object_manager = new GameObjectManager(this.process);
		await this.game_object_manager.init();
	}
	async loop() {
		const running = await this.process?.isRunning();
		if (!running) {
			await this.init();
			console.log('[Core] Initialized');
		}
		setTimeout(async () => {
			const settings = await this.settings();
			this.game_object_manager.update();

			this.drawings();
			if (user32.GetAsyncKeyState(0x2e) & 1) {
				this.overlay.webContents.send('toggle-menu');
			}
			if (user32.GetAsyncKeyState(settings.triggerkey)) {
				this.triggerbot();
			} else {
				if (user32.GetAsyncKeyState(settings.aimkey)) {
					this.aimbot();
				}
			}

			this.loop();
		}, 1);
	}
	async aimbot() {
		this.settings().then((settings) => {
			this.game_object_manager.entities().then((entities) => {
				if (entities.length > 0) {
					this.game_object_manager.localplayer().then((local_player) => {
						if (local_player) {
							this.sortClosestToMouse(entities, 9).then((closest) => {
								let target = null;
								for (const entity of closest) {
									if (entity.team !== local_player.team) {
										target = entity;
										break;
									}
								}
								if (target && target.bone_position_screen) {
									const bone_position = target.bone_position_screen[9];
									if (bone_position) {
										const RCS = 2;
										const FOV = settings.fov;
										const SMOOTH = settings.smooth;

										let {x, y} = bone_position;
										this.getDistance3D(local_player.origin, target.origin).then((distance) => {
											//get relative values
											this.process.getWindowRect().then((window_rect) => {
												const window_width = window_rect.right - window_rect.left;
												const window_height = window_rect.bottom - window_rect.top;
												const mid_x = window_width / 2;
												const mid_y = window_height / 2;

												const fov_p = local_player.fov;
												const aim_punch = local_player.aim_punch_angle;
												const rcs_x = ((aim_punch.x * RCS) / fov_p) * (window_height / 2);
												const rcs_y = ((aim_punch.y * RCS) / fov_p) * (window_width / 2);
												const delta_x = x - mid_x;
												const delta_y = y - mid_y;
												const fov_x_rad = (Math.abs(delta_x) / (window_width / 2)) * fov_p;
												const fov_y_rad = (Math.abs(delta_y) / (window_height / 2)) * fov_p;
												const fov_x_distance = fov_x_rad * Math.max(1, distance / 100);
												const fov_y_distance = fov_y_rad * Math.max(1, distance / 200);

												const rcs_delta_x = delta_x + rcs_y;
												const rcs_delta_y = delta_y - rcs_x;

												const fov_check = fov_x_distance + fov_y_distance;
												if (fov_check < FOV) {
													//get aim pixels
													const aim_x = rcs_delta_x / Math.min(Math.max(5, Math.abs(rcs_delta_x)), SMOOTH);
													const aim_y = rcs_delta_y / Math.min(Math.max(5, Math.abs(rcs_delta_y)), SMOOTH);
													this.movemouse(aim_x, aim_y);
												}
											});
										});
									}
								}
							});
						}
					});
				}
			});
		});
		await new Promise((resolve) => setTimeout(resolve, 25));
	}
	async triggerbot() {
		this.game_object_manager.entities().then((entities) => {
			if (entities.length > 0) {
				this.game_object_manager.localplayer().then((local_player) => {
					if (local_player) {
						const target_index = local_player.crosshair_id;
						if (target_index) {
							const target = entities[target_index - 1];
							if (target && target.team != local_player.team) {
								this.leftclick();
							}
						}
					}
				});
			}
		});
		await new Promise((resolve) => setTimeout(resolve, 25));
	}

	async drawings() {
		this.game_object_manager.entities().then((entities) => {
			let screenUpdates = [];
			update_view_matrix(this.process).then(() => {
				get_view_matrix().then((view_matrix) => {
					this.process.getWindowRect().then((window_rect) => {
						const overlay_rect = this.process.overlay.getBounds();
						for (const entity of entities) {
							if (entity) {
								screenUpdates.push(entity.updateScreen(view_matrix, window_rect, overlay_rect));
							}
						}
						Promise.all(screenUpdates).then(() => {
							if (entities.length > 0) {
								this.game_object_manager.localplayer().then((local_player) => {
									if (local_player) {
										const enemies = entities.filter(
											(entity) =>
												entity && entity.health > 0 && entity.team !== local_player.team && entity.dormant === 0
										);
										const line_start = {
											x: window_rect.x + window_rect.width / 2,
											y: window_rect.y + window_rect.bottom,
										};
										const lines = enemies
											.map((entity) => {
												return {start: line_start, end: entity.origin_screen_drawings};
											})
											.filter((object) => object.start && object.end);

										const boxes = enemies
											.map((entity) => {
												return {
													start: entity.origin_screen_drawings,
													end: entity.bone_position_screen_drawings[8],
													health: entity.health,
													armor: entity.armor,
												};
											})
											.filter((object) => object.start && object.end);

										const data = {
											lines,
											boxes,
										};
										this.overlay.webContents.send('drawings', data);
									}
								});
							}
						});
					});
				});
			});
		});
	}

	async getDistance2D(pos1, pos2) {
		return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
	}
	async getDistance3D(pos1, pos2) {
		return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2) + Math.pow(pos1.z - pos2.z, 2));
	}

	async sortClosestToMouse(entities, bone_index) {
		const cursorbuffer = Buffer.alloc(8);
		user32.GetCursorPos(cursorbuffer);
		const cursor_position = {
			x: cursorbuffer.readInt32LE(0),
			y: cursorbuffer.readInt32LE(4),
		};
		const distances = [];
		for (const entity of entities) {
			if (!entity || entity.health <= 0 || !entity.spotted) {
				continue;
			}
			if (!entity.bone_position_screen) {
				continue;
			}
			const bone_position = entity.bone_position_screen[bone_index];
			if (!bone_position) {
				continue;
			}

			const distance = await this.getDistance2D(bone_position, cursor_position);
			distances.push({...entity, distance: distance});
		}
		distances.sort((a, b) => a.distance - b.distance);
		return distances;
	}

	async leftclick() {
		const input = Buffer.alloc(40);
		input.writeUInt32LE(0x0002, 20);
		user32.SendInput(1, input, input.length);
		await new Promise((resolve) => setTimeout(resolve, 20));
		input.writeUInt32LE(0x0004, 20);
		user32.SendInput(1, input, input.length);
	}
	async movemouse(x, y) {
		const input = Buffer.alloc(40);
		input.writeInt32LE(x, 8);
		input.writeInt32LE(y, 12);
		input.writeUInt32LE(0x0001, 20);
		user32.SendInput(1, input, input.length);
	}
}

module.exports = Core;
