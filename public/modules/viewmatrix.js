const Offsets = require('./offsets.js');
const Process = require('./process.js');

const get_view_matrix = async () => {
	const offsets = await Offsets();
	const process = await Process();

	const data = process.memory.readBuffer(process.handle, process.client.base_address + offsets.signatures.dwViewMatrix, 64);
	let view_matrix = [];
	for (let i = 0; i < 16; i++) {
		view_matrix[i] = data.readFloatLE(i * 4);
	}
	return view_matrix;
};

module.exports = {get_view_matrix};
