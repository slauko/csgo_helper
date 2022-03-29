import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import Draggable from 'react-draggable';
import { TabContext, TabList, TabPanel } from '@mui/lab';

import './Menu.css';
import { Checkbox, Slider, Tab } from '@mui/material';
const { ipcRenderer } = window.require('electron');

const boneOptions = [
	{ value: 8, label: 'HEAD' },
	{ value: 7, label: 'NECK' },
	{ value: 6, label: 'BODY' },
];

const keyOptions = [
	{ value: 1, label: 'MB1' },
	{ value: 5, label: 'MX2' },
	{ value: 6, label: 'MX1' },
];

const selectTheme = (theme) => {
	let newTheme = {
		...theme,
		colors: {
			danger: 'white',
			dangerLight: 'white',
			primary: 'rgba(100,100,100,0.5)',
			primary25: 'rgba(100,100,100,0.5)',
			primary50: 'rgba(0,0,0,0.3)',
			primary75: 'white',
			neutral0: 'rgba(0,0,0,0.9)',
			neutral5: 'white',
			neutral10: 'white',
			neutral20: 'white',
			neutral30: 'white',
			neutral40: 'white',
			neutral50: 'white',
			neutral60: 'white',
			neutral70: 'white',
			neutral80: 'white',
			neutral90: 'white',
		},
	};
	return newTheme;
};

const sliderStyle = {
	color: 'white',
	height: 2,
	'& .MuiSlider-thumb': {
		height: 15,
		width: 15,
		'&:focus, &:hover, &.Mui-active': { boxShadow: 0 },
	},
};

const checkboxStyle = {
	color: 'white',
	'&.Mui-checked': {
		color: 'white',
	},
};

export default function Menu({ settings, setSettings }) {
	//AIM SETTINGS
	const [FOV, setFOV] = useState(settings.aim.fov);
	const [SMOOTH, setSMOOTH] = useState(settings.aim.smooth);
	const [BONE, setBONE] = useState(settings.aim.bone);
	const [AIMKEY, setAIMKEY] = useState(settings.aim.aimkey);
	const [TRIGGERKEY, setTRIGGERKEY] = useState(settings.aim.triggerkey);

	//ESP SETTINGS
	const [LINES, setLINES] = useState(settings.esp.lines);
	const [BOXES, setBOXES] = useState(settings.esp.boxes);
	const [HEALTH, setHEALTH] = useState(settings.esp.health);
	const [ARMOR, setARMOR] = useState(settings.esp.armor);
	const [AMMO, setAMMO] = useState(settings.esp.ammo);
	const [WEAPONS, setWEAPONS] = useState(settings.esp.weapons);

	useEffect(() => {
		ipcRenderer.send('savesettings', settings);
		//REFRESH AIM SETTINGS
		setFOV(settings.aim.fov);
		setSMOOTH(settings.aim.smooth);
		setBONE(settings.aim.bone);
		setAIMKEY(settings.aim.aimkey);
		setTRIGGERKEY(settings.aim.triggerkey);
		//REFRESH ESP SETTINGS
		setLINES(settings.esp.lines);
		setBOXES(settings.esp.boxes);
		setHEALTH(settings.esp.health);
		setARMOR(settings.esp.armor);
		setAMMO(settings.esp.ammo);
		setWEAPONS(settings.esp.weapons);
	}, [settings]);

	const handleFOVchange = (e, value) => {
		let newSettings = { ...settings };
		newSettings.aim.fov = value;
		setSettings(newSettings);
	};
	const handleSMOOTHchange = (e, value) => {
		let newSettings = { ...settings };
		newSettings.aim.smooth = value;
		setSettings(newSettings);
	};
	const handleBONEchange = (e) => {
		let newSettings = { ...settings };
		newSettings.aim.bone = e;
		setSettings(newSettings);
	};
	const handleAIMKEYchange = (e) => {
		let newSettings = { ...settings };
		newSettings.aim.aimkey = e;
		setSettings(newSettings);
	};
	const handleTRIGGERKEYchange = (e) => {
		let newSettings = { ...settings };
		newSettings.aim.triggerkey = e;
		setSettings(newSettings);
	};

	const handleESPLines = (e) => {
		let newSettings = { ...settings };
		newSettings.esp.lines = e.target.checked;
		setSettings(newSettings);
	};
	const handleESPBoxes = (e) => {
		let newSettings = { ...settings };
		newSettings.esp.boxes = e.target.checked;
		setSettings(newSettings);
	};
	const handleESPHealth = (e) => {
		let newSettings = { ...settings };
		newSettings.esp.health = e.target.checked;
		setSettings(newSettings);
	};
	const handleESPArmor = (e) => {
		let newSettings = { ...settings };
		newSettings.esp.armor = e.target.checked;
		setSettings(newSettings);
	};
	const handleESPAmmo = (e) => {
		let newSettings = { ...settings };
		newSettings.esp.ammo = e.target.checked;
		setSettings(newSettings);
	};
	const handleESPWeapons = (e) => {
		let newSettings = { ...settings };
		newSettings.esp.weapons = e.target.checked;
		setSettings(newSettings);
	};

	const handleMenuDrag = (e) => {
		let newSettings = { ...settings };
		//get parent element rect
		let r = e.path[2].getBoundingClientRect();

		//-2 because border
		let x = r.x;
		let y = r.y;

		let currentPosition = { x, y };
		newSettings.misc = { ...newSettings.misc, menuPosition: currentPosition };
		setSettings(newSettings);
	};

	const [activeTab, setActiveTab] = useState('AIM');

	return (
		<Draggable handle='strong' onStop={handleMenuDrag} position={settings.misc.menuPosition}>
			<div className='box no-cursor Menu'>
				<strong className='cursor'>
					<div className='Title'>CSGO HELPER MENU</div>
				</strong>
				<div className='Content'>
					<TabContext value={activeTab}>
						<TabList
							onChange={(e, value) => {
								setActiveTab(value);
							}}
							TabIndicatorProps={{ style: { background: 'white' } }}
							variant='fullWidth'
							centered
						>
							<Tab label='AIM' value='AIM' style={{ fontSize: 'large', fontWeight: 'bold', color: 'white' }} />
							<Tab label='ESP' value='ESP' style={{ fontSize: 'large', fontWeight: 'bold', color: 'white' }} />
							<Tab label='MISC' value='MISC' style={{ fontSize: 'large', fontWeight: 'bold', color: 'white' }} />
						</TabList>
						<TabPanel value='AIM' style={{ padding: '10px' }}>
							<div className='sliderContainer'>
								<label>FOV</label>
								<Slider value={FOV} onChange={(e) => setFOV(e.target.value)} onChangeCommitted={handleFOVchange} sx={sliderStyle} min={1} />
								<p style={{ fontSize: 'large' }}>{FOV}</p>
								<label>SMOOTH</label>
								<Slider value={SMOOTH} onChange={(e) => setSMOOTH(e.target.value)} onChangeCommitted={handleSMOOTHchange} sx={sliderStyle} min={1} />
								<p style={{ fontSize: 'large' }}>{SMOOTH}</p>
							</div>
							<div className='selectorContainer'>
								<label>BONE</label>
								<Select className='KeySelect' options={boneOptions} theme={selectTheme} value={{ value: 0, label: BONE.label }} onChange={handleBONEchange} />
								<div></div>
								<label>AIM</label>
								<Select className='KeySelect' options={keyOptions} theme={selectTheme} value={{ value: 0, label: AIMKEY.label }} onChange={handleAIMKEYchange} />
								<div></div>
								<label>TRIGGER</label>
								<Select className='KeySelect' options={keyOptions} theme={selectTheme} value={{ value: 0, label: TRIGGERKEY.label }} onChange={handleTRIGGERKEYchange} />
								<div></div>
							</div>
						</TabPanel>
						<TabPanel value='ESP' style={{ padding: '10px', fontWeight: 'bold' }}>
							<div className='checkboxContainer'>
								<label>LINES</label>
								<Checkbox sx={checkboxStyle} onChange={handleESPLines} checked={LINES} />
								<label>BOXES</label>
								<Checkbox sx={checkboxStyle} onChange={handleESPBoxes} checked={BOXES} />
								<label>HEALTH</label>
								<Checkbox sx={checkboxStyle} onChange={handleESPHealth} checked={HEALTH} />
								<label>ARMOR</label>
								<Checkbox sx={checkboxStyle} onChange={handleESPArmor} checked={ARMOR} />
								<label>AMMO</label>
								<Checkbox sx={checkboxStyle} onChange={handleESPAmmo} checked={AMMO} />
								<label>WEAPONS</label>
								<Checkbox sx={checkboxStyle} onChange={handleESPWeapons} checked={WEAPONS} />
							</div>
						</TabPanel>
						<TabPanel value='MISC' style={{ padding: '10px', fontWeight: 'bold' }}>
							<div className='checkboxContainer'>
								<label></label>
								<label>soon™(WIP)</label>
							</div>
						</TabPanel>
					</TabContext>
				</div>
			</div>
		</Draggable>
	);
}
