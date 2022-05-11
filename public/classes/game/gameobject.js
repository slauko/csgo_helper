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

		this.offsets = await Offsets();
		const netvars = this.offsets.netvars;
		const buffer = await this.process.readMemory(this.address, 100000);

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
		this.spotted = buffer.readUInt8(netvars.m_bSpotted);
		this.dormant = buffer.readUInt8(netvars.m_bDormant);
		this.shots_fired = buffer.readInt32LE(netvars.m_iShotsFired);
		this.crosshair_id = buffer.readInt32LE(netvars.m_iCrosshairId);
		this.fov = buffer.readUInt32LE(netvars.m_iFOV) || buffer.readUInt32LE(netvars.m_iFOVStart);

		const bone_base = buffer.readUInt32LE(netvars.m_dwBoneMatrix);
		const bone_buffer = await this.process.readMemory(bone_base, 1000);
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
			this.bone_position_screen[i] = await WorldToScreen(this.bone_position[i], this.process);
			this.bone_position_screen_drawings[i] = await WorldToScreenDrawings(this.bone_position[i], this.process);
		}
		this.origin_screen = await WorldToScreen(this.origin, this.process);
		this.origin_screen_drawings = await WorldToScreenDrawings(this.origin, this.process);
	}
}

module.exports = GameObject;
