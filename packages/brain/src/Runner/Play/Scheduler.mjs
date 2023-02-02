import { definePlay } from '@produck/duck-runner';

export const play = definePlay(async function Scheduler({
	Log, Scheduler, Group,
}) {
	Log('Schedular');

	Group.on('round', async () => {
		Log.Scheduler('Scheduler evaluating...');
		await Scheduler.evaluate();
		Log.Scheduler('Scheduler end.');
	});
});
