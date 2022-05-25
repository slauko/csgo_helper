const memoryjs = require('memoryjs');
const {FindWindow} = require('./windowsfunctions');

let process = null;
const process_name = 'csgo.exe';
const process_window_name = 'Counter-Strike: Global Offensive - Direct3D 9';

const Process = async () => {
	if (process && FindWindow(null, process_window_name)) {
		return process;
	}

	try {
		const procc = memoryjs.openProcess(process_name);
		const client = memoryjs.findModule('client.dll', procc.th32ProcessID);
		const engine = memoryjs.findModule('engine.dll', procc.th32ProcessID);
		process = {
			pid: procc.th32ProcessID,
			handle: procc.handle,
			base_address: procc.modBaseAddr,
			client: {base_address: client.modBaseAddr},
			engine: {base_address: engine.modBaseAddr},
			memory: memoryjs,
		};
	} catch (error) {
		console.error(error);
		setTimeout(Process, 1000);
	}

	return process;
};

module.exports = Process;
