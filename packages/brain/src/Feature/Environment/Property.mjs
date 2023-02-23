import { Normalizer, P, S } from '@produck/mold';

const sec = n => n * 1000;

export const PropertySchemas = {
	'ENVIRONMENT.REFRESH.INTERVAL': P.UINT32(sec(5)),
	'ENVIRONMENT.AT': P.UINT32(0),

	'BRAIN.ALIVE.TIMEOUT': P.UINT32(sec(30)),
	'BRAIN.ALIVE.INTERVAL': P.UINT32(sec(1)),

	'APPLICATION.REQUEST.TIMEOUT': P.UINT32(sec(60)),

	'PRODUCT.QUEUE.MAX': P.UINT32(1000),
	'PRODUCT.ORDER.CREATION.TIMEOUT': P.UINT32(sec(60)),

	'TENTACLE.SYNC.INTERVAL': P.UINT32(sec(1)),
	'TENTACLE.SYNC.TIMEOUT': P.UINT32(sec(5)),

	'JOB.VISIT.TIMEOUT': P.UINT32(sec(10)),

	'RJSP.SERVER.HOST': P.String('127.0.0.1'),
	'RJSP.SERVER.PORT': P.UINT32(9173),
	'RJSP.REDIRECT.ENABLED': P.Boolean(false),
};

export const Schema = S.Object(PropertySchemas);
export const normalize = Normalizer(Schema);

const PropertyValue = {};

for (const name in PropertySchemas) {
	PropertyValue[name] = Normalizer(PropertySchemas[name]);
}

export const normalizeValue = (name, value) => PropertyValue[name](value);
