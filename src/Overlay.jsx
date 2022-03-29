import React, { useEffect, useState } from 'react';
import Drawings from './Drawings';
import Menu from './Menu';
import './Overlay.css';
import { v4 as uuid } from 'uuid';

const { ipcRenderer } = window.require('electron');
const initSettings = ipcRenderer.sendSync('loadsettings');

let timer = performance.now();

export default function Overlay() {
	const [settings, setSettings] = useState(initSettings);
	const [menuOpen, setMenuOpen] = useState(false);

	const [entities, setEntities] = useState([]);
	useEffect(() => {
		ipcRenderer.on('openmenu', (event, open) => {
			setMenuOpen(open);
			event.returnValue = 'menu done';
		});

		ipcRenderer.on('draw', (event, data) => {
			setEntities(data);
			event.returnValue = 'draw done';
		});
	}, []);

	setTimeout(() => {
		ipcRenderer.send('render');
	}, 1);

	return (
		<div className='Overlay'>
			{entities.map((ent) => {
				return <Drawings key={uuid()} entity={ent} settings={settings} />;
			})}
			{menuOpen && <Menu settings={settings} setSettings={setSettings} />}
		</div>
	);
}
