import { Mesh, Scene, Vector3, Vector3Tuple } from "three";
import { Game } from "../game";
import { ITickable } from "../tickable";
import { Map2D } from "../util/map-2d";
import { Chunk, CHUNK_HEIGHT, CHUNK_WIDTH } from "./chunk";
import { ChunkColumnManager } from "./chunk-column-manager";
import pEachSeries from "p-each-series";
import { Block } from "../block/block";

export enum ChunkColumnPriority {
    // Render & Tick
    High = 3,
    // Render
    Middle = 2,
    // Generate
    Low = 1,
    // Prepare
    Lowest = 0,
}

export class ChunkColumn implements ITickable {    
    public readonly chunks: Chunk[] = [];
    public heightMap?: Map2D<number>;
    
    private chunksBuilt = false;
    private chunksGenerated = false;
    private priority: ChunkColumnPriority = ChunkColumnPriority.Lowest;

    public constructor(
        private readonly manager: ChunkColumnManager,
        private readonly position: [number, number],
        height: number,
    ) {
        for (let i = 0; i < height; i++) {
            this.chunks.push(new Chunk(this, new Vector3(position[0], i, position[1])));
        }
    }

    public register(scene: Scene) {
        this.chunks.forEach((chunk) => chunk.register(scene));
    }

    public unregister(scene: Scene) {
        this.chunks.forEach((chunk) => chunk.unregister(scene));
    }

    public async generatePrototype() {
        if (this.heightMap) {
            return;
        }

        this.heightMap = await Game.main.chunkGeneratorPool.generateHeightMap(this.position);
    }

    public async setPriority(priority: ChunkColumnPriority) {
        if (this.priority === priority) {
            return;
        }

        const oldPriority = this.priority;
        this.priority = priority;

        if (priority >= ChunkColumnPriority.Low && priority > oldPriority) {
            if (!this.chunksGenerated) {
                await pEachSeries(this.chunks, (chunk) => chunk.generateTerrain(true));
                this.chunksGenerated = true;
            }

            this.manager.requestChunkUpdate(this);
        }
    }

    public async requestedUpdate(): Promise<void> {
        if (
            this.chunksGenerated
            && !this.chunksBuilt
            && this.areNeighborsGenerated()
        ) {
            await Promise.all(this.chunks.map((chunk) => chunk.buildMesh()));
            this.chunksBuilt = true;
            this.requestNeighborColumnsToUpdate();
        }
    }

    private areNeighborsGenerated() {
        return [[-1, 0], [1, 0], [0, -1], [0, 1]].reduce((result, pos) => {
            if (!result) {
                return false;
            }

            return this.manager.getChunkColumn(
                this.position[0] + pos[0],
                this.position[1] + pos[1],
            )?.chunksGenerated ?? false;
        }, true);
    }

    private requestNeighborColumnsToUpdate() {
        [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach((pos) => {
            const neighbor = this.manager.getChunkColumn(
                this.position[0] + pos[0],
                this.position[1] + pos[1],
            );
            if (!neighbor) {
                return;
            }

            this.manager.requestChunkUpdate(neighbor);
        });
    }

    public onTick(deltaTime: number): void {
        this.chunks.forEach((chunk) => {
            chunk.onTick(deltaTime);
            if (this.priority === ChunkColumnPriority.High) {
                chunk.tickBlocks();
            }
        });
    }

    public lateUpdate(deltaTime: number) {
        if (this.priority <= ChunkColumnPriority.Low) {
            return;
        }

        this.chunks.forEach((chunk) => chunk.lateUpdate(deltaTime));
    }

    public setBlockAt([x, y, z]: Vector3Tuple, block: Block): void {
        const chunkLocalY = Math.floor(y / CHUNK_HEIGHT);
        if (chunkLocalY < 0 || chunkLocalY >= this.chunks.length) {
            return;
        }
        
        return this.chunks[chunkLocalY].setBlock([x, y - chunkLocalY * CHUNK_HEIGHT, z], block);
    }

    public getBlockAt([x, y, z]: Vector3Tuple): Block | undefined {
        const chunkLocalY = Math.floor(y / CHUNK_HEIGHT);
        if (!this.chunks[chunkLocalY]) {
            return undefined;
        }

        return this.chunks[chunkLocalY].getBlock([x, y - chunkLocalY * CHUNK_HEIGHT, z]);
    }

    public getChunkMeshes(): Mesh[] {
        return this.chunks.flatMap((chunk) => [chunk.solidMesh, chunk.transparentMesh]).filter((chunk) => chunk !== undefined);
    }

    public getChunk(absolutePos: [number, number, number]): Chunk | undefined {
        if (this.position[0] === absolutePos[0] && this.position[1] === absolutePos[2]) {
            return this.chunks[absolutePos[1]];
        }

        const neighborColumn = this.manager.getChunkColumn(absolutePos[0], absolutePos[2]);
        if (!neighborColumn) {
            return undefined;
        }

        return neighborColumn.chunks[absolutePos[1]];
    }
}
