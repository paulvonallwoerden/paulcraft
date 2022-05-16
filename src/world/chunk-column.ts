import SimplexNoise from "simplex-noise";
import { BoxGeometry, Color, Mesh, MeshStandardMaterial, Scene, SphereGeometry, Vector2, Vector2Tuple, Vector3, Vector3Tuple } from "three";
import { AIR_BLOCK_ID, GRASS_BLOCK_ID, MYCELIUM_BLOCK_ID } from "../block/block-ids";
import { Game } from "../game";
import { ITickable } from "../tickable";
import { indexToXZ } from "../util/index-to-vector2";
import { Map2D } from "../util/map-2d";
import { Biome } from "./biome/biome";
import { Chunk, CHUNK_HEIGHT, CHUNK_WIDTH } from "./chunk";
import { ChunkColumnManager } from "./chunk-column-manager";
import { OakTreeFeature } from "./feature/oak-tree-feature";
import { WorldFeatureBuilder } from "./feature/world-feature";
import pEachSeries from "p-each-series";
import pAll from "p-all";

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

    private indiMesh = new Mesh(new BoxGeometry(4, 0.2, 4), new MeshStandardMaterial({ color: 'white' }));

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
        // scene.add(this.indiMesh);
        // this.indiMesh.position.set(this.position[0] * 16 + 6, 64, this.position[1] * 16 + 6);
    }

    public unregister(scene: Scene) {
        this.chunks.forEach((chunk) => chunk.unregister(scene));
        // scene.remove(this.indiMesh);
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
        this.indiMesh.material.color = (function(c: ChunkColumn): Color {
            let r = 0;
            let g = 0;
            let b = 0;
            if (c.chunksGenerated) {
                r = 1;
            }
            if (c.chunksBuilt) {
                g = 1;
            }
            if (c.priority >= ChunkColumnPriority.Low) {
                b = 1;
            }

            return new Color(r, g, b);
        }(this));

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

    public setBlockAt([x, y, z]: Vector3Tuple, blockId: number): void {
        const chunkLocalY = Math.floor(y / CHUNK_HEIGHT);
        if (chunkLocalY < 0 || chunkLocalY >= this.chunks.length) {
            return;
        }

        return this.chunks[chunkLocalY].setBlock([x, y - chunkLocalY * CHUNK_HEIGHT, z], blockId);
    }

    public getBlockAt([x, y, z]: Vector3Tuple): number | undefined {
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
