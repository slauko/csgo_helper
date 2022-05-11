const fetch = require('electron-fetch').default;

let offsets = null;
const Offsets = async () => {
	if (offsets) {
		return offsets;
	}

	const data = await fetch('https://raw.githubusercontent.com/frk1/hazedumper/master/csgo.json');

	offsets = await data.json();
	return offsets;
};

module.exports = Offsets;
