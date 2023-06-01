const fs = require('fs');
const path = require('path');
const { fork } = require('child_process');

const logpath = path.resolve('crash.log');

if (fs.existsSync(logpath)) {
	fs.rmSync(logpath);
}

const crash = fork(path.join(__dirname, 'brain.mjs'));

crash.on('close', () => {
	process.exit(fs.existsSync(logpath) ? 0 : 1);
});
