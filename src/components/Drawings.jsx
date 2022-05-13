import React from 'react';

// let counter = 0;
// let timer = new Date();
// let timercount = 0;

export const Drawings = ({settings}) => {
	const [drawings, setDrawings] = React.useState({});
	React.useEffect(() => {
		window.ipcRenderer.once('drawings', (event, data) => {
			// counter++;
			// let current = new Date();
			// let frametime = current - timer;
			// timercount += frametime;
			// if (timercount > 1000) {
			// 	console.log(`${counter} frames in ${timercount}ms`);

			// 	timercount = 0;
			// 	counter = 0;
			// }
			// timer = current;

			setDrawings(data);
		});
	}, [drawings]);

	if (!drawings) {
		return <></>;
	}
	return (
		<div className='Drawings'>
			{drawings.lines?.map((line, index) => {
				return <div key={index} className='Line'></div>;
			})}
			{settings.boxes &&
				drawings.boxes?.map((box, index) => {
					const box_heigth = (box.start.y - box.end.y) * 1.1;
					const box_width = box_heigth / 2;
					const box_x = box.start.x - box_width / 2;
					const box_y = box.start.y - box_heigth;
					return (
						<div
							key={index}
							className='Box'
							style={{
								position: 'absolute',
								left: `${box_x}px`,
								top: `${box_y}px`,
								border: `1px solid red`,
								borderRadius: '1px',
								boxShadow: '0px 0px 1px 1px black,inset 0px 0px 1px 1px black ',
								width: `${box_width}px`,
								height: `${box_heigth}px`,
							}}
						>
							{settings.armor && (
								<div
									style={{
										position: 'absolute',
										bottom: '0',
										right: `${box_width * 0.05}px`,
										width: `${box_width * 0.04}px`,
										height: `${box.armor}%`,
										borderRadius: '1px',
										backgroundColor: `rgba(0,0,255, 1.0)`,
										boxShadow: '0px 0px 1px 1px black',
									}}
								></div>
							)}
							{settings.health && (
								<div
									style={{
										position: 'absolute',
										bottom: '0',
										right: '0',
										width: `${box_width * 0.04}px`,
										height: `${box.health}%`,
										borderRadius: '2px',
										backgroundColor: `rgba(${255 * (1.5 - box.health / 100.0)},${200 * (box.health / 100.0)},0, 1.0)`,
										boxShadow: '0px 0px 1px 1px black',
									}}
								></div>
							)}
						</div>
					);
				})}
			{/* <FPSStats /> */}
		</div>
	);
};
