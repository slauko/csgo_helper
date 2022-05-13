const Offsets = require('./offsets.js');

let view_matrix = [];
const update_view_matrix = async (process) => {
	const offsets = await Offsets();
	const data = await process.readMemory(offsets.signatures.dwViewMatrix, 64, 'client');
	for (let i = 0; i < 16; i++) {
		view_matrix[i] = data.readFloatLE(i * 4);
	}
};
const get_view_matrix = async () => {
	return view_matrix;
};
module.exports = {update_view_matrix, get_view_matrix};
