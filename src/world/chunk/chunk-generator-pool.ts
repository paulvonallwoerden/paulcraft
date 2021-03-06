import { Remote, wrap } from "comlink";
import ChunkGeneratorWorker from "./chunk-generator.worker.ts";
import type { ChunkGenerator } from "./chunk-generator.worker";
import { Biome } from "../biome/biome";
import { ArrayMap2D, Map2D, PaletteMap2D } from "../../util/map-2d";
import { CHUNK_WIDTH } from "./chunk-constants";
import { Vector2, Vector2Tuple } from "three";
import { randomElement } from "../../util/random-element";
import { BlockPos } from "../../block/block-pos";
import { ChunkBlockData } from "../chunk-renderer";

export class ChunkGeneratorPool {
    private readonly workers: Remote<ChunkGenerator>[] = [];

    public constructor() {}

    public async addWorkers(numberOfWorkers: number) {
        const ChunkGeneratorClass = wrap<typeof ChunkGenerator>(new ChunkGeneratorWorker());
        for (let i = 0; i < numberOfWorkers; i++) {          
            const instance = await new ChunkGeneratorClass(4545);
            this.workers.push(instance);
        }
    }

    public async buildBaseTerrain(chunkPosition: BlockPos): Promise<Uint8Array> {
        return this.getWorker().buildTerrain([chunkPosition.x, chunkPosition.y, chunkPosition.z]);
    }

    public async decorateTerrain(chunkPosition: Vector2Tuple, blockData: Uint8Array[]): Promise<Uint8Array[]> {
        return this.getWorker().decorateTerrain(chunkPosition, blockData);
    }

    private getWorker() {
        return randomElement(this.workers);
    }
}
