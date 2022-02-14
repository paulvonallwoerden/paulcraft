import { Remote, wrap } from "comlink";
import ChunkGeneratorWorker from "./chunk-generator.worker.ts";
import type { ChunkGenerator } from "./chunk-generator.worker";
import { Biome } from "../biome/biome";
import { ArrayMap2D, Map2D, PaletteMap2D } from "../../util/map-2d";
import { CHUNK_WIDTH } from "./chunk-constants";
import { Vector2 } from "three";
import { randomElement } from "../../util/random-element";

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

    public async buildBaseTerrain(heightMap: Map2D<number>): Promise<Uint8Array> {
        return this.getWorker().buildBaseTerrain(heightMap.serialize());
    }

    public async generateBiomeMap(chunkPosition: Vector2): Promise<Map2D<Biome>> {
        const biomes = await this.getWorker().generateBiomeMap(chunkPosition);

        return PaletteMap2D.fromArray(biomes, CHUNK_WIDTH);
    }

    public async generateHeightMap(chunkPosition: Vector2, biomeMap: Map2D<Biome>): Promise<Map2D<number>> {
        const heights = await this.getWorker().generateHeightMap(chunkPosition, biomeMap.serialize());

        return new ArrayMap2D(heights, CHUNK_WIDTH);
    }

    private getWorker() {
        return randomElement(this.workers);
    }
}
