const {get_view_matrix} = require('./viewmatrix');
const WorldToScreen = async (position, process) => {
	const view_matrix = await get_view_matrix();
	let screen_position = {};
	let w = 0.0;
	screen_position.x =
		view_matrix[0] * position.x + view_matrix[1] * position.y + view_matrix[2] * position.z + view_matrix[3];
	screen_position.y =
		view_matrix[4] * position.x + view_matrix[5] * position.y + view_matrix[6] * position.z + view_matrix[7];

	w = view_matrix[12] * position.x + view_matrix[13] * position.y + view_matrix[14] * position.z + view_matrix[15];
	if (w < 0.01) {
		return false;
	}
	let invw = 1.0 / w;

	screen_position.x *= invw;
	screen_position.y *= invw;

	let bounds = await process.getWindowRect();
	let width = bounds.right - bounds.left;
	let height = bounds.bottom - bounds.top;
	let x = width / 2;
	let y = height / 2;
	x += 0.5 * screen_position.x * width + 0.5;
	y -= 0.5 * screen_position.y * height + 0.5;
	screen_position.x = x + bounds.left;
	screen_position.y = y + bounds.top;
	return screen_position;
};
const WorldToScreenDrawings = async (position, process) => {
	const view_matrix = await get_view_matrix();
	let screen_position = {};
	let w = 0.0;
	screen_position.x =
		view_matrix[0] * position.x + view_matrix[1] * position.y + view_matrix[2] * position.z + view_matrix[3];
	screen_position.y =
		view_matrix[4] * position.x + view_matrix[5] * position.y + view_matrix[6] * position.z + view_matrix[7];

	w = view_matrix[12] * position.x + view_matrix[13] * position.y + view_matrix[14] * position.z + view_matrix[15];
	if (w < 0.01) {
		return false;
	}
	let invw = 1.0 / w;

	screen_position.x *= invw;
	screen_position.y *= invw;

	let bounds = await process.overlay.getBounds();
	let width = bounds.width;
	let height = bounds.height;
	let x = width / 2;
	let y = height / 2;
	x += 0.5 * screen_position.x * width + 0.5;
	y -= 0.5 * screen_position.y * height + 0.5;
	screen_position.x = x + bounds.x;
	screen_position.y = y + bounds.y;
	return screen_position;
};
module.exports = {WorldToScreen, WorldToScreenDrawings};
