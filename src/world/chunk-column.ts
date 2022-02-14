import SimplexNoise from "simplex-noise";
import { Mesh, Scene, Vector2, Vector2Tuple, Vector3, Vector3Tuple } from "three";
import { AIR_BLOCK_ID, GRASS_BLOCK_ID, MYCELIUM_BLOCK_ID } from "../block/block-ids";
import { ITickable } from "../tickable";
import { indexToXZ } from "../util/index-to-vector2";
import { Map2D } from "../util/map-2d";
import { Biome } from "./biome/biome";
import { Chunk, CHUNK_HEIGHT, CHUNK_WIDTH } from "./chunk";
import { OakTreeFeature } from "./feature/oak-tree-feature";
import { WorldFeatureBuilder } from "./feature/world-feature";

export enum ChunkColumnPriority {
    // Render
    High = 3,
    // Don't render; just tick
    Middle = 2,
    // Don't render; don't tick; just generate
    Low = 1,
    // Idle - do nothing
    Lowest = -1,
}

export class ChunkColumn implements ITickable {
    private isDirty = true;

    private fullyGenerated = false;

    public readonly chunks: Chunk[];

    private priority: ChunkColumnPriority = ChunkColumnPriority.Lowest;
    private biomeMap?: Map2D<Biome>;
    private heightMap?: Map2D<number>;

    public constructor(
        readonly position: [number, number],
        readonly height: number,
    ) {
        this.chunks = [];
        for (let i = 0; i < height; i++) {
            this.chunks.push(new Chunk(new Vector3(position[0], i, position[1])));
        }
    }

    public register(scene: Scene) {
        this.chunks.forEach((chunk) => chunk.register(scene));
    }

    public unregister(scene: Scene) {
        this.chunks.forEach((chunk) => chunk.unregister(scene));
    }

    public setPriority(priority: ChunkColumnPriority) {
        if (this.priority === priority) {
            return;
        }

        if (priority > ChunkColumnPriority.Low && priority > this.priority) {
            if (!this.fullyGenerated) {
                this.chunks.forEach((chunk) => chunk.generateTerrain());
                this.fullyGenerated = true;
            }
        }

        if (priority >= ChunkColumnPriority.Middle && priority > this.priority) {

        }

        this.priority = priority;
    }

    public load(): void {
        // this.chunks.forEach((chunk) => chunk.generateTerrain());
    }

    public onTick(deltaTime: number): void {
        this.chunks.forEach((chunk) => {
            chunk.onTick(deltaTime);
            if (this.priority === ChunkColumnPriority.High) {
                chunk.tickBlocks();
            }
        });

        if (!this.isDirty) {
            return;
        }

        // console.log(this.chunks.filter((chunk) => chunk.isGenerated).length);

        const isChunkGenerating = this.chunks.some((chunk) => !chunk.isGenerated);
        if (!isChunkGenerating) {
            // this.chunks.forEach((chunk) => chunk.buildMesh());
            this.isDirty = false;
        }
    }

    public lateUpdate(deltaTime: number) {
        if (this.priority <= ChunkColumnPriority.Low) {
            return;
        }

        this.chunks.forEach((chunk) => chunk.lateUpdate(deltaTime));
    }

    private generateFeatures() {
        const featureBuilder: WorldFeatureBuilder = {
            setBlock: ([x, y, z], blockId) => {
                const chunkRow = Math.floor(y / CHUNK_HEIGHT);
                const chunkLocalY = y - chunkRow * CHUNK_HEIGHT;

                // TODO: Handle by placing block in neighbor chunk column.
                if (x < 0 || z < 0 || x >= CHUNK_WIDTH || z >= CHUNK_WIDTH) return;

                this.chunks[chunkRow].setBlock([x, chunkLocalY, z], blockId);
            },
        };

        // const numberOfTrees = Math.round(this.simplexNoise.noise2D(this.position.x * 0.1, this.position.y * 0.1) + 1);
        // const oakTreeFeature = new OakTreeFeature();
        // for (let i = 0; i < numberOfTrees; i++) {
        //     const x = Math.round(Math.random() * 16);
        //     const z = Math.round(Math.random() * 16);
        //     const y = this.getHeightAt([x, z]);
        //     if (y < 0) continue;
        //     if (this.getBlockAt([x, y, z]) !== GRASS_BLOCK_ID) continue;

        //     oakTreeFeature.place([x, y + 1, z], featureBuilder);
        // }
    }

    private getHeightAt([x, z]: Vector2Tuple): number {
        for (let i = 0; i < this.chunks.length; i++) {
            for (let y = 0; y < CHUNK_HEIGHT; y++) {
                const block = this.chunks[i].getBlock([x, y, z]);
                if (block !== AIR_BLOCK_ID) {
                    continue;
                }

                return i * CHUNK_HEIGHT + y - 1;
            }
        }

        return this.height * CHUNK_HEIGHT;
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

    // private generateFeatures() {
    //     if (this.position.y !== 0) {
    //         return;
    //     }

    //     const builder: WorldFeatureBuilder = {
    //         setBlock: ([x, y, z], blockId) => this.blockData[xyzTupelToIndex(x, y, z, CHUNK_WIDTH, CHUNK_HEIGHT)] = blockId,
    //     };
    //     const oakTreeFeature = new OakTreeFeature();
    //     oakTreeFeature.place([0, 0, 0], builder);
    // }
}
