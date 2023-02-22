import { definePlay } from '@produck/duck-runner';

export const play = definePlay(function ({
	Log, Configuration,
}) {
	for (const line of Configuration.banner) {
		Log.System(line);
	}
});
