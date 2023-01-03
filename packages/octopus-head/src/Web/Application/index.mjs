import { defineKoaApp } from '@produck/duck-web-koa';
import * as DuckWebKoaForker from '@produck/duck-web-koa-forker';

import * as Router from './Router/index.mjs';

export const Provider = defineKoaApp(function Application(app, {
	Forker,
}) {
	app.use(Forker());
}, [
	DuckWebKoaForker.Plugin({
		name: 'API',
		path: '/api',
		provider: Router.API,
		uses: [{
			name: 'Product',
			path: '/product/{productModel}',
			provider: Router.Product,
			uses: [{
				name: 'Job',
				path: '/{productId}/job',
				provider: Router.Job,
			}, {
				name: 'Order',
				path: '/{productId}/order',
			}, {
				name: 'Artifact',
				path: '/{productId}/artifact',
			}],
		}],
	}),
]);
