const {WorldToScreen} = require('./worldtoscreen');
const {SendInput} = require('./windowsfunctions');
const get_distance_2d = (pos1, pos2) => {
	return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
};
const get_distance_3d = (pos1, pos2) => {
	return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2) + Math.pow(pos1.z - pos2.z, 2));
};
const get_aim_data = async (entity_list, local_player, view_matrix, bounds) => {
	const aim_data = [];
	for (let i = 0; i < entity_list.length; i++) {
		if (entity_list[i]) {
			const new_data = {};
			new_data.entity = entity_list[i];
			new_data.distance = get_distance_3d(entity_list[i].origin, local_player.origin);
			new_data.screen_position = await WorldToScreen(entity_list[i].bone_position[7], view_matrix, bounds);
			new_data.is_alive = entity_list[i].health > 0 && entity_list[i].dormant === 0;
			new_data.is_enemy = entity_list[i].team !== local_player.team;
			new_data.is_visible = new_data.screen_position !== false && entity_list[i].spotted;
			aim_data.push(new_data);
		}
	}
	return aim_data;
};
const get_closest_target_mouse = (aim_data, mid_x, mid_y) => {
	let closest_target = null;
	let closest_distance = 99999;
	for (let i = 0; i < aim_data.length; i++) {
		if (aim_data[i].is_enemy && aim_data[i].is_visible && aim_data[i].is_alive) {
			const distance = get_distance_2d(aim_data[i].screen_position, {x: mid_x, y: mid_y});
			if (distance < closest_distance) {
				closest_distance = distance;
				closest_target = aim_data[i];
			}
		}
	}
	return closest_target;
};

const aimbot = async (entity_list, local_player, settings, view_matrix, bounds) => {
	const mid_x = bounds.width / 2;
	const mid_y = bounds.height / 2;
	const aim_data = await get_aim_data(entity_list, local_player, view_matrix, bounds);
	const target = await get_closest_target_mouse(aim_data, mid_x, mid_y);
	if (target) {
		const screen_position = target.screen_position;
		if (screen_position) {
			const RCS = 2;
			const FOV = settings.fov;
			const SMOOTH = settings.smooth;
			const {x, y} = screen_position;
			const distance = target.distance;

			//get relative values
			const window_width = bounds.width;
			const window_height = bounds.height;

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
				const aim_x = rcs_delta_x / Math.min(Math.max(10, Math.abs(rcs_delta_x)), SMOOTH);
				const aim_y = rcs_delta_y / Math.min(Math.max(10, Math.abs(rcs_delta_y)), SMOOTH);
				await movemouse(aim_x, aim_y);
			}
		}
	}
};
const movemouse = async (x, y) => {
	const input = Buffer.alloc(40);
	input.writeInt32LE(x, 8);
	input.writeInt32LE(y, 12);
	input.writeUInt32LE(0x0001, 20);
	SendInput(1, input, input.length);
};

const triggerbot = async (entity_list, local_player) => {
	const target_index = local_player.crosshair_id;
	if (target_index) {
		const target = entity_list[target_index - 1];
		if (target && target.team !== local_player.team) {
			await leftclick();
		}
	}
};
const leftclick = async () => {
	const input = Buffer.alloc(40);
	input.writeUInt32LE(0x0002, 20);
	SendInput(1, input, input.length);
	await new Promise((resolve) => setTimeout(resolve, 20));
	input.writeUInt32LE(0x0004, 20);
	SendInput(1, input, input.length);
	await new Promise((resolve) => setTimeout(resolve, 20));
};

module.exports = {aimbot, triggerbot};
