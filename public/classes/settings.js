const fs = require('fs');

let settings = {
	fov: 90,
	smooth: 30,
	lines: true,
	boxes: true,
	health: true,
	armor: true,
	aimkey: 6,
	triggerkey: 5,
	menupos: {
		x: 100,
		y: 100,
	},
};

const Settings = async () => {
	return settings;
};
const SaveSettings = async (data) => {
	fs.writeFile('settings.json', JSON.stringify(data, null, 2), (err) => {
		if (err) {
			console.log(err);
		}
	});
	settings = data;
};
const LoadSettings = async () => {
	try {
		settings = JSON.parse(await fs.readFileSync('settings.json', 'utf8'));
		return settings;
	} catch (error) {
		return settings;
	}
};

module.exports = {Settings, SaveSettings, LoadSettings};
