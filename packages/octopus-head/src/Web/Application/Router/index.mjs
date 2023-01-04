import * as DuckWebKoaForker from '@produck/duck-web-koa-forker';

import * as API from './API.mjs';
import * as Product from './Product.mjs';
import * as Job from './Job.mjs';
import * as Order from './Order.mjs';
import * as Artifact from './Artifact.mjs';

export const plugin = DuckWebKoaForker.Plugin({
	name: 'API',
	path: '/api',
	provider: API.Router,
	uses: [{
		name: 'Product',
		path: '/product/{productModel}',
		provider: Product.Router,
		uses: [{
			name: 'ProductMember',
			path: '/{productId}',
			uses: [{
				name: 'Job',
				path: '/job',
				provider: Job.Router,
			}, {
				name: 'Order',
				path: '/order',
				provider: Order.Router,
			}, {
				name: 'Artifact',
				path: '/artifact',
				provider: Artifact.Router,
			}],
		}],
	}],
});
