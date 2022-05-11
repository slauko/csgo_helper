const Offsets = require('./offsets.js');
const GameObject = require('./gameobject.js');

class GameObjectManager {
	constructor(process) {
		this.process = process;

		this.entity_list = [];
		this.local_player = null;
	}
	async init() {
		this.offsets = await Offsets();
	}
	async update() {
		const class_buffer = await this.process.readMemory(this.offsets.signatures.dwEntityList, 1000, 'client');
		let list = [];
		for (let i = 0; i < 60; i++) {
			let entity = null;
			const entity_address = class_buffer.readUInt32LE(i * 0x10);
			if (entity_address) {
				entity = new GameObject(this.process, entity_address);
				await entity.update();
			}
			list.push(entity);
		}
		this.entity_list = list;

		this.client_state = await this.process.readMemory(this.offsets.signatures.dwClientState, 4, 'engine');
		this.client_state = this.client_state.readUInt32LE(0);
		this.client_state_local_index_address = this.client_state + this.offsets.signatures.dwClientState_GetLocalPlayer;
		this.client_state_local_index = await this.process.readMemory(this.client_state_local_index_address, 4);
		this.client_state_local_index = this.client_state_local_index.readUInt32LE(0);

		this.local_player = this.entity_list[this.client_state_local_index];
	}
	async entities() {
		return this.entity_list;
	}
	async localplayer() {
		return this.local_player;
	}
}

module.exports = GameObjectManager;
