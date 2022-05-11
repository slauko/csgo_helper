import React from 'react';
export const Drawings = ({settings}) => {
	const [drawings, setDrawings] = React.useState([]);
	React.useEffect(() => {
		window.ipcRenderer.once('drawings', (event, data) => {
			setDrawings(data);
		});
	}, [drawings]);

	if (!drawings) {
		return null;
	}
	console.log(drawings);
	return <div className='Drawings'></div>;
};
