import { Remote } from "comlink";
import { randomElement } from "../util/random-element";

export abstract class WorkerPool<T> {
    protected readonly workers: Remote<T>[] = [];

    public async addWorkers(numberOfWorkers: number) {
        for (let i = 0; i < numberOfWorkers; i++) {          
            const worker = await this.instantiateWorker();
            this.workers.push(worker);
        }
    }

    protected abstract instantiateWorker(): Promise<Remote<T>>;

    protected getWorker(): Remote<T> {
        return randomElement(this.workers);
    }
}
