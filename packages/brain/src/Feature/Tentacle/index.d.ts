interface AgentMeta {
	craft: string;
	version: string;
}

export class Agent {
	readonly meta: AgentMeta | null;
	readonly isReady: boolean;
	receive(rpc: any[]): void;
	consume(): any[];
	setJob(): void;
	activate(): void;
	commit(): Promise<void>;
}

export interface Manager {
	fetch(id: string, meta: AgentMeta): Promise<Agent>;
	truncate(): Promise<void>;
}
