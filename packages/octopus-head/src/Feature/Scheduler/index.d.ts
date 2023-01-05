export interface Scheduler {
	evaluate(): Promise<void>;
}
