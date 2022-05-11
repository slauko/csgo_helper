const Offsets = require('./offsets.js');

let view_matrix = [];
const update_view_matrix = async (process) => {
	const offsets = await Offsets();
	const viewmatrix_buffer = await process.readMemory(offsets.signatures.dwViewMatrix, 64, 'client');
	let matrix = [];
	for (let i = 0; i < 16; i++) {
		matrix[i] = viewmatrix_buffer.readFloatLE(i * 4);
	}
	view_matrix = matrix;
};
const get_view_matrix = async () => {
	return view_matrix;
};
module.exports = {update_view_matrix, get_view_matrix};
