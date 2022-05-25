const ffi = require('ffi-napi');

const user32 = ffi.Library('user32', {
	FindWindowA: ['int', ['string', 'string']],
	GetAsyncKeyState: ['int', ['int']],
	GetCursorPos: ['int', ['pointer']],
	SendInput: ['int', ['int', 'pointer', 'int']],
});

const kernel32 = ffi.Library('kernel32', {});

const SendInput = user32.SendInput;
const FindWindow = user32.FindWindowA;
const GetCursorPos = user32.GetCursorPos;
const GetAsyncKeyState = user32.GetAsyncKeyState;

module.exports = {SendInput, FindWindow, GetCursorPos, GetAsyncKeyState};
