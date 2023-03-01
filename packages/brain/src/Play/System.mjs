import { definePlay } from '@produck/duck-runner';

export const play = definePlay(function ({
	Log, Configuration,
}) {
	return () => {
		for (const line of Configuration.banner) {
			Log.System(line);
		}
	};
});
