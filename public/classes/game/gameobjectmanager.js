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
		this.process.readMemory(this.offsets.signatures.dwEntityList, 1100, 'client').then((data) => {
			this.entity_list = [];
			for (let i = 0; i < 64; i++) {
				const entity_address = data.readUInt32LE(i * 0x10);
				if (entity_address) {
					this.entity_list.push(new GameObject(this.process, entity_address));
					this.entity_list[i].update();
				} else {
					this.entity_list.push(null);
				}
			}
			this.process.readMemory(this.offsets.signatures.dwClientState, 4, 'engine').then((data) => {
				this.client_state = data.readUInt32LE(0);
				const index_address = this.client_state + this.offsets.signatures.dwClientState_GetLocalPlayer;
				this.process.readMemory(index_address, 4).then((data) => {
					this.local_index = data.readUInt32LE(0);
					this.local_player = this.entity_list[this.local_index];
				});
			});
		});
	}
	async entities() {
		return this.entity_list;
	}
	async localplayer() {
		return this.local_player;
	}
}

module.exports = GameObjectManager;
