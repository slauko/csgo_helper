import React from 'react';
import {Menu} from './components/Menu';
import {Drawings} from './components/Drawings';
import './App.scss';
export const App = () => {
	const [settings, setSettings] = React.useState(null);
	React.useEffect(() => {
		if (settings) {
			// save to settings file
			window.ipcRenderer.invoke('save-settings', JSON.stringify(settings, null, 2));
		}
		if (!settings) {
			// load from settings file
			window.ipcRenderer.invoke('load-settings').then((result) => {
				setSettings(JSON.parse(result));
			});
		}
	}, [settings]);

	if (!settings) {
		return <></>;
	}

	return (
		<div className='App'>
			<Drawings settings={settings} />
			<Menu settings={settings} setSettings={setSettings} />
		</div>
	);
};
