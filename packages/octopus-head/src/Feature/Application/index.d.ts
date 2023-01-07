type PemString = string;

export class OctopusApplication {
	_remove(): Promise<void>;

	_getPublicKeyList(): Promise<void>;

	_appendPublicKey(): Promise<void>;

	_removePublicKey(): Promise<void>;

	readonly id: string;

	getPublicKeyList(): Promise<Array<PemString>>;

	verify(timestamp: string, signatureHex: string): Promise<boolean>;

	remove(): Promise<void>;

	appendPublickKey(pem: PemString): Promise<void>;

	removePublickKey(fingerprint: string): Promise<void>;
}

export interface Registry {
	has(id: string): Promise<boolean>;
	get(id: string): Promise<OctopusApplication> | Promise<null>;
	add(id: string): Promise<OctopusApplication>;
	remove(id: string): Promise<void>;
}
