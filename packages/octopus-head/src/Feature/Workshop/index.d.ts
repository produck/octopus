import * as Product from './Product'
import * as Job from './Job';

interface ProductManager {
	Queue: Product.Queue;
	Model: Product.ModelRegistry;
}

interface JobManager {
	Pool: Job.Pool;
	Craft: Job.CraftRegistry;
}

export interface Manager {
	Product: ProductManager;
	Job: JobManager;
}
