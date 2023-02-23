import * as DuckWebKoaForker from '@produck/duck-web-koa-forker';

import * as Sync from './Sync.mjs';
import * as Job from './Job.mjs';

export const plugin = DuckWebKoaForker.Plugin({
	name: 'RJSP',
	path: '/api',
	uses: [{
		name: 'Sync',
		path: '/sync',
		provider: Sync.Router,
	}, {
		name: 'Job',
		path: '/job',
		provider: Job.Router,
	}],
});

export { Sync, Job };
