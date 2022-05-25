import React, {useEffect, useState} from 'react';
import {Menu} from './components/Menu';
import {Drawings} from './components/Drawings';
import './App.scss';

const default_settings = {
	fov: '30',
	smooth: '99',
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
export const App = () => {
	const [drawings, setDrawings] = useState({});
	const [settings, setSettings] = useState(null);
	const [menuActive, setMenuActive] = useState(false);

	useEffect(() => {
		window.ipcRenderer.on('toggle-menu', (event, menu_active) => {
			setMenuActive(menu_active);
		});
	}, []);
	useEffect(() => {
		setTimeout(() => {
			window.ipcRenderer.invoke('update').then((data) => {
				setDrawings(data);
			});
		}, 1);
	}, [drawings]);
	useEffect(() => {
		if (!settings) {
			window.ipcRenderer.invoke('load-settings').then((data) => {
				if (data) {
					setSettings(data);
				} else setSettings(default_settings);
			});
		} else {
			window.ipcRenderer.invoke('save-settings', settings);
		}
	}, [settings]);

	if (!settings) {
		return null;
	}

	return (
		<div className='App'>
			<Drawings drawings={drawings} settings={settings} />
			{menuActive && <Menu settings={settings} setSettings={setSettings} />}
		</div>
	);
};
