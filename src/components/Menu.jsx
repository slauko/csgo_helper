import React, {useState} from 'react';
import Draggable from 'react-draggable';
import {Col, Row} from 'react-bootstrap';
import keycode from 'keycode';
export const Menu = ({settings, setSettings}) => {
	const GetKeyName = (key) => {
		switch (key) {
			case 0:
				return '0';
			case 1:
				return 'LMB';
			case 2:
				return 'RMB';
			case 3:
				return '';
			case 4:
				return 'MWHEEL';
			case 5:
				return 'MX1';
			case 6:
				return 'MX2';
			default:
				return keycode(key);
		}
	};
	const GetCorrectMouseKey = (key) => {
		switch (key) {
			case 0:
				return 1;
			case 1:
				return 4;
			case 2:
				return 2;
			case 3:
				return 5;
			case 4:
				return 6;
			default:
				return null;
		}
	};

	const handleDragStop = (e, data) => {
		setSettings({...settings, menupos: {x: data.x, y: data.y}});
	};

	const [changeAim, setChangeAim] = useState(false);
	const [changeTrigger, setChangeTrigger] = useState(false);

	return (
		<Draggable handle='.Menu .Header' onStop={handleDragStop} position={settings.menupos}>
			<div className='Menu'>
				<div className='Header'>
					<strong>HELPER MENU</strong>
				</div>
				<div className='Content'>
					<Row className='Category'>
						<strong>AIM SETTINGS:</strong>
						<Col className='Labels'>
							<div className='Label'>FOV:</div>
							<div className='Label'>SMOOTH:</div>
						</Col>
						<Col className='Sliders'>
							<div className='Slider'>
								<input
									type='range'
									min='1'
									max='99'
									value={settings.fov}
									onChange={(e) => {
										setSettings({...settings, fov: e.target.value});
									}}
								/>
							</div>
							<div className='Slider'>
								<input
									type='range'
									min='1'
									max='99'
									value={settings.smooth}
									onChange={(e) => {
										setSettings({...settings, smooth: e.target.value});
									}}
								/>
							</div>
						</Col>
						<Col className='Values'>
							<div className='Value'>{settings.fov}</div>
							<div className='Value'>{settings.smooth}</div>
						</Col>
					</Row>
					<Row className='Category KeySelect'>
						<Col className='Labels'>
							<div className='Label'>AIMKEY:</div>
							<div className='Label'>TRIGGERKEY:</div>
						</Col>
						<Col className='Buttons'>
							<div className='Button'>
								<button
									type='button'
									onMouseEnter={(e) => {
										const element = e.target;

										element.addEventListener(
											'keydown',
											(e) => {
												e.preventDefault();
												setSettings({...settings, aimkey: e.keyCode});
												setChangeAim(false);
												element.blur();
											},
											{once: true}
										);

										element.addEventListener(
											'mousedown',
											(e) => {
												e.preventDefault();
												const mousekey = GetCorrectMouseKey(e.button);
												if (mousekey) {
													setSettings({...settings, aimkey: mousekey});
												}
												setChangeAim(false);
												element.blur();
											},
											{once: true}
										);

										element.focus();
										setChangeAim(true);
									}}
									onMouseLeave={(e) => {
										const element = e.target;
										element.removeEventListener('keydown', () => {});
										element.removeEventListener('mousedown', () => {});
										setChangeAim(false);
										element.blur();
									}}
								>
									{changeAim ? 'Press...' : GetKeyName(settings.aimkey).toUpperCase()}
								</button>
							</div>
							<div className='Button'>
								<button
									type='button'
									onMouseEnter={(e) => {
										const element = e.target;

										element.addEventListener(
											'keydown',
											(e) => {
												e.preventDefault();
												setSettings({...settings, triggerkey: e.keyCode});
												setChangeTrigger(false);
												element.blur();
											},
											{once: true}
										);

										element.addEventListener(
											'mousedown',
											(e) => {
												e.preventDefault();
												const mousekey = GetCorrectMouseKey(e.button);
												if (mousekey) {
													setSettings({...settings, triggerkey: mousekey});
												}
												setChangeTrigger(false);
												element.blur();
											},
											{once: true}
										);

										element.focus();
										setChangeTrigger(true);
									}}
									onMouseLeave={(e) => {
										const element = e.target;
										element.removeEventListener('keydown', () => {});
										element.removeEventListener('mousedown', () => {});
										setChangeTrigger(false);
										element.blur();
									}}
								>
									{changeTrigger ? 'Press...' : GetKeyName(settings.triggerkey).toUpperCase()}
								</button>
							</div>
						</Col>
					</Row>
					<Row className='Category'>
						<strong>DRAW SETTINGS:</strong>
						<Col className='Labels' style={{paddingLeft: '30px'}}>
							<div className='Label'>LINES:</div>
							<div className='Label'>BOXES:</div>
						</Col>
						<Col className='Checkboxes'>
							<div className='Checkbox'>
								<input
									type='checkbox'
									checked={settings.lines}
									onChange={(e) => {
										setSettings({...settings, lines: e.target.checked});
									}}
								/>
							</div>
							<div className='Checkbox'>
								<input
									type='checkbox'
									checked={settings.boxes}
									onChange={(e) => {
										setSettings({...settings, boxes: e.target.checked});
									}}
								/>
							</div>
						</Col>
						<Col className='Labels'>
							<div className='Label'>HEALTH:</div>
							<div className='Label'>ARMOR:</div>
						</Col>
						<Col className='Checkboxes'>
							<div className='Checkbox'>
								<input
									type='checkbox'
									checked={settings.health}
									onChange={(e) => {
										setSettings({...settings, health: e.target.checked});
									}}
								/>
							</div>
							<div className='Checkbox'>
								<input
									type='checkbox'
									checked={settings.armor}
									onChange={(e) => {
										setSettings({...settings, armor: e.target.checked});
									}}
								/>
							</div>
						</Col>
					</Row>
				</div>
			</div>
		</Draggable>
	);
};
