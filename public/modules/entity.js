const Offsets = require('./offsets.js');
const Process = require('./process.js');

const get_entity_from_address = async (address) => {
	let entity = {address};
	if (address === 0) {
		return entity;
	}
	const offsets = await Offsets();
	const process = await Process();
	const buffer = process.memory.readBuffer(process.handle, entity.address, 100000);
	entity.aim_punch_angle = {
		x: buffer.readFloatLE(offsets.netvars.m_aimPunchAngle),
		y: buffer.readFloatLE(offsets.netvars.m_aimPunchAngle + 4),
		z: buffer.readFloatLE(offsets.netvars.m_aimPunchAngle + 8),
	};
	entity.origin = {
		x: buffer.readFloatLE(offsets.netvars.m_vecOrigin),
		y: buffer.readFloatLE(offsets.netvars.m_vecOrigin + 4),
		z: buffer.readFloatLE(offsets.netvars.m_vecOrigin + 8),
	};
	entity.view_offset = {
		x: buffer.readFloatLE(offsets.netvars.m_vecViewOffset),
		y: buffer.readFloatLE(offsets.netvars.m_vecViewOffset + 4),
		z: buffer.readFloatLE(offsets.netvars.m_vecViewOffset + 8),
	};
	entity.team = buffer.readInt32LE(offsets.netvars.m_iTeamNum);
	entity.armor = buffer.readInt32LE(offsets.netvars.m_ArmorValue);
	entity.flags = buffer.readInt32LE(offsets.netvars.m_fFlags);
	entity.health = buffer.readInt32LE(offsets.netvars.m_iHealth);
	entity.spotted = buffer.readUIntLE(offsets.netvars.m_bSpotted, 1);
	entity.dormant = buffer.readUIntLE(offsets.signatures.m_bDormant, 1);
	entity.shots_fired = buffer.readInt32LE(offsets.netvars.m_iShotsFired);
	entity.crosshair_id = buffer.readInt32LE(offsets.netvars.m_iCrosshairId);
	entity.fov = buffer.readUInt32LE(offsets.netvars.m_iFOV) || buffer.readUInt32LE(offsets.netvars.m_iFOVStart);

	const bone_base = buffer.readUInt32LE(offsets.netvars.m_dwBoneMatrix);
	const bone_buffer = process.memory.readBuffer(process.handle, bone_base, 1000);
	entity.bone_position = [];
	for (let i = 0; i < 12; i++) {
		entity.bone_position[i] = {
			x: bone_buffer.readFloatLE(i * 0x30 + 0x0c),
			y: bone_buffer.readFloatLE(i * 0x30 + 0x1c),
			z: bone_buffer.readFloatLE(i * 0x30 + 0x2c),
		};
	}
	return entity;
};

const get_entity_list = async () => {
	let entity_list = [];
	const process = await Process();
	const offsets = await Offsets();

	const entity_buffer = process.memory.readBuffer(process.handle, process.client.base_address + offsets.signatures.dwEntityList, 1100);
	for (let i = 0; i < 64; i++) {
		const entity_address = entity_buffer.readUInt32LE(i * 0x10);
		if (entity_address) {
			entity_list[i] = await get_entity_from_address(entity_address);
		} else {
			entity_list[i] = null;
		}
	}
	return entity_list;
};

const get_local_player_index = async () => {
	const process = await Process();
	const offsets = await Offsets();
	const client_state = process.memory.readBuffer(process.handle, process.engine.base_address + offsets.signatures.dwClientState, 4).readUInt32LE(0);
	return process.memory.readBuffer(process.handle, client_state + offsets.signatures.dwClientState_GetLocalPlayer, 4).readUInt32LE(0);
};

module.exports = {get_entity_from_address, get_entity_list, get_local_player_index};
