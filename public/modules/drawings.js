const {WorldToScreen} = require('./worldtoscreen');
const get_drawings = async (entity_list, local_player, view_matrix, bounds) => {
	const drawings = {};
	drawings.boxes = [];
	for (let index = 0; index < entity_list.length; index++) {
		const entity = entity_list[index];
		if (entity && entity.team !== local_player.team && entity.health > 0 && entity.dormant === 0) {
			const screen_head = await WorldToScreen(entity.bone_position[8], view_matrix, bounds);
			const screen_origin = await WorldToScreen(entity.origin, view_matrix, bounds);
			if (screen_head && screen_origin) {
				drawings.boxes.push({
					start: screen_origin,
					end: screen_head,
					health: entity.health,
					armor: entity.armor,
				});
			}
		}
	}
	return drawings;
};

module.exports = {get_drawings};
