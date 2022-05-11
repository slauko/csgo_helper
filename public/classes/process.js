const ffi = require('ffi-napi');
const memoryjs = require('memoryjs');

const user32 = ffi.Library('user32', {
	FindWindowA: ['int', ['string', 'string']],
	GetAsyncKeyState: ['int', ['int']],
	GetWindowRect: ['int', ['int', 'pointer']],
});

class Process {
	constructor(game_window_name, game_process_name, overlay) {
		this.game_process = null;
		this.game_window_handle = null;
		this.game_window_name = game_window_name;
		this.game_process_name = game_process_name;
		this.overlay = overlay;
	}
	async init() {
		this.game_window_handle = user32.FindWindowA(null, this.game_window_name);
		while (!this.game_window_handle) {
			this.game_window_handle = user32.FindWindowA(null, this.game_window_name);
			console.log('Game not found, waiting...');
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}
		this.game_process = memoryjs.openProcess(this.game_process_name);
		this.game_client = memoryjs.findModule('client.dll', this.game_process.th32ProcessID);
		this.game_engine = memoryjs.findModule('engine.dll', this.game_process.th32ProcessID);
	}
	async isRunning() {
		return user32.FindWindowA(null, this.game_window_name);
	}
	async getWindowRect() {
		const rect = Buffer.alloc(4 * 4);
		user32.GetWindowRect(this.game_window_handle, rect);
		return {
			left: rect.readInt32LE(0),
			top: rect.readInt32LE(4),
			right: rect.readInt32LE(8),
			bottom: rect.readInt32LE(12),
		};
	}

	async isKeyPressed(key) {
		return user32.GetAsyncKeyState(key);
	}
	async readMemory(address, size, from_base = null) {
		if (from_base === 'client') {
			address += this.game_client.modBaseAddr;
		}
		if (from_base === 'engine') {
			address += this.game_engine.modBaseAddr;
		}
		return memoryjs.readBuffer(this.game_process.handle, address, size);
	}
}

module.exports = Process;
