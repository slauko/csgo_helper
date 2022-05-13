const Offsets = require('./offsets.js');
const {WorldToScreen, WorldToScreenDrawings} = require('./worldtoscreen.js');

class GameObject {
	constructor(process, address) {
		this.process = process;
		this.address = address;
	}
	async update() {
		if (!this.address) {
			return;
		}

		Offsets().then(async (offsets) => {
			this.offsets = offsets;
			const netvars = this.offsets.netvars;
			const signatures = this.offsets.signatures;
			this.process.readMemory(this.address, 100000).then((buffer) => {
				this.aim_punch_angle = {
					x: buffer.readFloatLE(netvars.m_aimPunchAngle),
					y: buffer.readFloatLE(netvars.m_aimPunchAngle + 4),
					z: buffer.readFloatLE(netvars.m_aimPunchAngle + 8),
				};
				this.origin = {
					x: buffer.readFloatLE(netvars.m_vecOrigin),
					y: buffer.readFloatLE(netvars.m_vecOrigin + 4),
					z: buffer.readFloatLE(netvars.m_vecOrigin + 8),
				};
				this.view_offset = {
					x: buffer.readFloatLE(netvars.m_vecViewOffset),
					y: buffer.readFloatLE(netvars.m_vecViewOffset + 4),
					z: buffer.readFloatLE(netvars.m_vecViewOffset + 8),
				};
				this.team = buffer.readInt32LE(netvars.m_iTeamNum);
				this.armor = buffer.readInt32LE(netvars.m_ArmorValue);
				this.flags = buffer.readInt32LE(netvars.m_fFlags);
				this.health = buffer.readInt32LE(netvars.m_iHealth);
				this.spotted = buffer.readUIntLE(netvars.m_bSpotted, 1);
				this.dormant = buffer.readUIntLE(signatures.m_bDormant, 1);
				this.shots_fired = buffer.readInt32LE(netvars.m_iShotsFired);
				this.crosshair_id = buffer.readInt32LE(netvars.m_iCrosshairId);
				this.fov = buffer.readUInt32LE(netvars.m_iFOV) || buffer.readUInt32LE(netvars.m_iFOVStart);

				const bone_base = buffer.readUInt32LE(netvars.m_dwBoneMatrix);
				this.process.readMemory(bone_base, 1000).then((bone_buffer) => {
					this.bone_position = [];
					for (let i = 0; i < 12; i++) {
						this.bone_position[i] = {
							x: bone_buffer.readFloatLE(i * 0x30 + 0x0c),
							y: bone_buffer.readFloatLE(i * 0x30 + 0x1c),
							z: bone_buffer.readFloatLE(i * 0x30 + 0x2c),
						};
					}
					this.bone_position_screen = [];
					this.bone_position_screen_drawings = [];
					for (let i = 0; i < 12; i++) {
						WorldToScreen(this.bone_position[i], this.process).then((screen) => {
							this.bone_position_screen[i] = screen;
						});
						WorldToScreenDrawings(this.bone_position[i], this.process).then((screen) => {
							this.bone_position_screen_drawings[i] = screen;
						});
					}
				});
				WorldToScreen(this.origin, this.process).then((origin_screen) => {
					this.origin_screen = origin_screen;
				});
				WorldToScreenDrawings(this.origin, this.process).then((origin_screen_drawings) => {
					this.origin_screen_drawings = origin_screen_drawings;
				});
			});
		});
	}
}

module.exports = GameObject;
