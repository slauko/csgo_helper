import React from 'react';

export default function Drawings({ entity, settings }) {
	const hp = entity.health;
	const arm = entity.armor;
	const pos = entity.screenPos;

	const ammo = settings.esp.ammo;
	const armor = settings.esp.armor;
	const lines = settings.esp.lines;
	const boxes = settings.esp.boxes;
	const health = settings.esp.health;
	const weapons = settings.esp.weapons;

	const box_heigth = (entity.screenPos.y - entity.screenHeadPos.y) * 1.1;
	const box_width = box_heigth / 2;
	const box_x = entity.screenPos.x - box_width / 2;
	const box_y = entity.screenPos.y - box_heigth;
	return (
		<>
			{/* {lines && <div style={{}}></div>} */}
			{boxes && (
				<div
					style={{
						position: 'absolute',
						left: `${box_x}px`,
						top: `${box_y}px`,
						border: `${Math.min(2, box_width * 0.02)}px solid red`,
						borderRadius: '1px',
						boxShadow: '0px 0px 1px 1px black,inset 0px 0px 1px 1px black ',
						width: `${box_width}px`,
						height: `${box_heigth}px`,
					}}
				>
					{armor && (
						<div
							style={{
								position: 'absolute',
								bottom: '0',
								right: `${box_width * 0.05}px`,
								width: `${box_width * 0.04}px`,
								height: `${arm}%`,
								borderRadius: '1px',
								backgroundColor: `rgba(0,0,255, 1.0)`,
								boxShadow: '0px 0px 1px 1px black',
							}}
						></div>
					)}
					{health && (
						<div
							style={{
								position: 'absolute',
								bottom: '0',
								right: '0',
								width: `${box_width * 0.04}px`,
								height: `${hp}%`,
								borderRadius: '2px',
								backgroundColor: `rgba(${255 * (1.5 - hp / 100.0)},${200 * (hp / 100.0)},0, 1.0)`,
								boxShadow: '0px 0px 1px 1px black',
							}}
						></div>
					)}
				</div>
			)}
		</>
	);
}
