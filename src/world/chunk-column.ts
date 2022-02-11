import SimplexNoise from "simplex-noise";
import { Mesh, Scene, Vector2, Vector2Tuple, Vector3, Vector3Tuple } from "three";
import { AIR_BLOCK_ID, GRASS_BLOCK_ID } from "../block/block-ids";
import { ITickable } from "../tickable";
import { Chunk, CHUNK_HEIGHT, CHUNK_WIDTH } from "./chunk";
import { OakTreeFeature } from "./feature/oak-tree-feature";
import { WorldFeatureBuilder } from "./feature/world-feature";

export class ChunkColumn implements ITickable {
    private isDirty = true;

    private readonly chunks: Chunk[];

    public constructor(
        readonly scene: Scene,
        readonly position: Vector2,
        readonly height: number,
        readonly simplexNoise: SimplexNoise,
    ) {

        this.chunks = [];
        for (let i = 0; i < height; i++) {
            this.chunks.push(new Chunk(scene, new Vector3(position.x, i, position.y), simplexNoise));
        }
    }

    public load(): void {
        this.chunks.forEach((chunk) => chunk.generateTerrain());
    }

    public onTick(deltaTime: number): void {
        this.chunks.forEach((chunk) => chunk.onTick(deltaTime));

        if (!this.isDirty) {
            return;
        }

        // console.log(this.chunks.filter((chunk) => chunk.isGenerated).length);

        const isChunkGenerating = this.chunks.some((chunk) => !chunk.isGenerated);
        if (!isChunkGenerating) {
            this.generateFeatures();
            this.chunks.forEach((chunk) => chunk.buildMesh());
            this.isDirty = false;
        }
    }

    private generateFeatures() {
        const featureBuilder: WorldFeatureBuilder = {
            setBlock: ([x, y, z], blockId) => {
                const chunkRow = Math.floor(y / CHUNK_HEIGHT);
                const chunkLocalY = y - chunkRow * CHUNK_HEIGHT;

                // TODO: Handle by placing block in neighbor chunk column.
                if (x < 0 || z < 0 || x >= CHUNK_WIDTH || z >= CHUNK_WIDTH) return;

                this.chunks[chunkRow].setBlock([x, chunkLocalY, z], blockId, true);
            },
        };

        const numberOfTrees = Math.round(this.simplexNoise.noise2D(this.position.x * 0.1, this.position.y * 0.1) + 1);
        const oakTreeFeature = new OakTreeFeature();
        for (let i = 0; i < numberOfTrees; i++) {
            const x = Math.round(Math.random() * 16);
            const z = Math.round(Math.random() * 16);
            const y = this.getHeightAt([x, z]);
            if (y < 0) continue;
            if (this.getBlockAt([x, y, z]) !== GRASS_BLOCK_ID) continue;

            oakTreeFeature.place([x, y + 1, z], featureBuilder);
        }
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
        return this.chunks.map((chunk) => chunk.chunkMesh).filter((chunk) => chunk !== undefined);
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
