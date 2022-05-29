import { BufferAttribute, Mesh, Scene, Vector3, Vector3Tuple } from 'three';
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper';
import { Game } from '../game';
import { indexToPos, indexToXZY, posToIndex, xyzTupelToIndex, xzyToIndex } from '../util/index-to-vector3';
import { ITickable } from '../tickable';
import { ChunkColumn } from './chunk-column';
import { Blocks } from '../block/blocks';
import { Block } from '../block/block';
import { BlockState } from '../block/block-state/block-state';
import { ChunkBlockData } from './chunk-renderer';
import { WorldFeature } from './feature/world-feature';
import { floodFillBlockLight, floodFillBlockLightAdditive } from '../light/flood-fill';
import { BlockPos, modifyBlockPosValues } from '../block/block-pos';
import { mod } from '../util/mod';

export const CHUNK_WIDTH = 16;
export const CHUNK_HEIGHT = 16;

export class Chunk implements ITickable {
    private shouldRebuild = false;
    private rebuildsEnabled = false;

    private blockData: Uint8Array = new Uint8Array(CHUNK_WIDTH * CHUNK_WIDTH * CHUNK_HEIGHT);
    private blockStates: Map<number, BlockState> = new Map();

    // private skyLight: Uint8Array = new Uint8Array(CHUNK_WIDTH * CHUNK_WIDTH * CHUNK_HEIGHT);
    // private blockLight: Uint8Array = new Uint8Array(CHUNK_WIDTH * CHUNK_WIDTH * CHUNK_HEIGHT);

    public readonly solidMesh: Mesh;
    public readonly waterMesh: Mesh;
    public readonly transparentMesh: Mesh;
    public readonly foliageMesh: Mesh;

    private normalHelper?: VertexNormalsHelper;

    public constructor(
        private readonly chunkColumn: ChunkColumn,
        private readonly position: Vector3,
    ) {
        const { solid, transparent, water, foliage } = Game.main.blocks.getBlockMaterials();
        this.solidMesh = new Mesh(undefined, solid);
        this.transparentMesh = new Mesh(undefined, transparent);
        this.waterMesh = new Mesh(undefined, water);
        this.foliageMesh = new Mesh(undefined, foliage);
    }

    public register(scene: Scene) {
        const worldPosition = this.position.clone().multiply(new Vector3(CHUNK_WIDTH, CHUNK_HEIGHT, CHUNK_WIDTH));
        this.solidMesh.position.set(worldPosition.x, worldPosition.y, worldPosition.z);
        this.waterMesh.position.set(worldPosition.x, worldPosition.y, worldPosition.z);
        this.transparentMesh.position.set(worldPosition.x, worldPosition.y, worldPosition.z);
        this.foliageMesh.position.set(worldPosition.x, worldPosition.y, worldPosition.z);
        scene.add(this.solidMesh);
        scene.add(this.waterMesh);
        scene.add(this.transparentMesh);
        scene.add(this.foliageMesh);
    }

    public unregister(scene: Scene) {
        if (this.solidMesh?.geometry) this.solidMesh.geometry.dispose();
        if (this.waterMesh?.geometry) this.waterMesh.geometry.dispose();
        if (this.transparentMesh?.geometry) this.transparentMesh.geometry.dispose();
        if (this.foliageMesh?.geometry) this.foliageMesh.geometry.dispose();

        scene.remove(this.solidMesh);
        scene.remove(this.waterMesh);
        scene.remove(this.transparentMesh);
        scene.remove(this.foliageMesh);

        if (this.normalHelper) Game.main.scene.remove(this.normalHelper);
    }

    public onTick(deltaTime: number): void {}

    /**
     * Some blocks are chosen at random and ticked.
     *
     * Reference: https://minecraft.fandom.com/wiki/Tick#Random_tick
     */
    public tickBlocks() {
        for (let i = 0; i < 3; i++) {
            this.tickRandomBlock();
        }
    }

    private tickRandomBlock() {
        const blockPos = new Vector3(
            Math.floor(Math.random() * CHUNK_WIDTH),
            Math.floor(Math.random() * CHUNK_WIDTH),
            Math.floor(Math.random() * CHUNK_WIDTH),
        );
        const blockId = this.blockData[xzyToIndex(blockPos, CHUNK_WIDTH, CHUNK_WIDTH)];
        const block = Blocks.getBlockById(blockId);
        if (!block) {
            return;
        }

        block.onRandomTick(Game.main.level, {
            x: blockPos.x + this.position.x * CHUNK_WIDTH,
            y: blockPos.y + this.position.y * CHUNK_HEIGHT,
            z: blockPos.z + this.position.z * CHUNK_WIDTH,
        });
    }

    public lateUpdate(deltaTime: number) {
        if (this.shouldRebuild) {
            this.shouldRebuild = false;
            this.buildMesh();
        }
    }

    public async generateTerrain() {
        this.blockData = await Game.main.chunkGeneratorPool.buildBaseTerrain(this.position);
    }

    public async decorateTerrain() {
        this.applySpilledBlockData();
        // const chunkContext: Omit<ChunkBlockData, 'blockModelIndices'> = {
        //     blocks: this.blockData,
        //     neighborBlocks: this.getNeighborChunks().map((chunk) => chunk?.blockData ?? new Uint8Array()),
        // };
        // this.blockData = await Game.main.chunkGeneratorPool.decorateTerrain(this.position, chunkContext);
    }

    private applySpilledBlockData() {
        const spilledBlockData = this.chunkColumn.getSpilledBlockData();
        if (!spilledBlockData) {
            return;
        }

        for (let x = 0; x < CHUNK_WIDTH; x++) {
            for (let y = 0; y < CHUNK_HEIGHT; y++) {
                for (let z = 0; z < CHUNK_WIDTH; z++) {
                    const index = xyzTupelToIndex(x, y + this.position.y * CHUNK_HEIGHT, z, CHUNK_WIDTH, CHUNK_WIDTH);
                    const spilledBlock = spilledBlockData[index];
                    if (!spilledBlock) {
                        continue;
                    }

                    const blockDataIndex = xyzTupelToIndex(x, y, z, CHUNK_WIDTH, CHUNK_WIDTH);
                    this.blockData[blockDataIndex] = spilledBlock;
                }
            }    
        }
    }

    public requestRebuild() {
        if (!this.rebuildsEnabled) {
            return;
        }

        this.shouldRebuild = true;
    }

    public async buildMesh() {
        const blockModelIndices: Record<number, number> = {};
        this.blockStates.forEach((state, index) => {
            const block = Blocks.getBlockById(this.blockData[index]);
            blockModelIndices[index] = block.getBlockModel(state);
        });

        if (this.solidMesh?.geometry) this.solidMesh.geometry.dispose();
        if (this.waterMesh?.geometry) this.waterMesh.geometry.dispose();
        if (this.transparentMesh?.geometry) this.transparentMesh.geometry.dispose();
        if (this.foliageMesh?.geometry) this.foliageMesh.geometry.dispose();

        const blockLight = new Uint8Array(this.blockData.length);
        for (let i = 0; i < this.blockData.length; i++) {
            const block = Blocks.getBlockById(this.blockData[i]);
            const lightLevel = block.getLightLevel();
            if (lightLevel <= 0) {
                continue;
            }

            const pos = indexToPos(i);
            floodFillBlockLightAdditive(blockLight, this.blockData, pos, lightLevel);
        }

        const geometry = await Game.main.chunkGeometryBuilderPool.buildGeometry(
            this.position,
            {
                blockModelIndices,
                blocks: this.blockData,
                neighborBlocks: this.getNeighborChunks().map((chunk) => chunk?.blockData ?? new Uint8Array()),
                blockLight,
                skyLight: this.chunkColumn.getSkyLight(),
            },
        );
        this.solidMesh.geometry = geometry.solid;
        this.waterMesh.geometry = geometry.water;
        this.transparentMesh.geometry = geometry.transparent;
        this.foliageMesh.geometry = geometry.foliage;

        // if (this.normalHelper) Game.main.scene.remove(this.normalHelper);
        // this.normalHelper = new VertexNormalsHelper(this.solidMesh, 0.5);
        // Game.main.scene.add(this.normalHelper);
    }

    private getNeighborChunks() {
        return [
            this.chunkColumn.getChunk([this.position.x, this.position.y + 1, this.position.z]),
            this.chunkColumn.getChunk([this.position.x, this.position.y - 1, this.position.z]),
            this.chunkColumn.getChunk([this.position.x - 1, this.position.y, this.position.z]),
            this.chunkColumn.getChunk([this.position.x + 1, this.position.y, this.position.z]),
            this.chunkColumn.getChunk([this.position.x, this.position.y, this.position.z - 1]),
            this.chunkColumn.getChunk([this.position.x, this.position.y, this.position.z + 1]),
        ];
    }

    public setBlock([x, y, z]: Vector3Tuple, block: Block): void {
        const oldBlockId = this.blockData[xyzTupelToIndex(x, y, z, CHUNK_WIDTH, CHUNK_WIDTH)];
        const newBlockId = Blocks.getBlockId(block);
        if (newBlockId === oldBlockId) {
            return;
        }
        this.blockData[xyzTupelToIndex(x, y, z, CHUNK_WIDTH, CHUNK_WIDTH)] = newBlockId;

        this.requestRebuild();

        // TODO: Only update the relevant chunk
        if (x <= 0 || y <= 0 || z <= 0 || x >= CHUNK_WIDTH - 1 || y >= CHUNK_HEIGHT - 1 || z >= CHUNK_WIDTH - 1) {
            this.getNeighborChunks().filter((chunk): chunk is Chunk => chunk !== undefined).forEach((chunk) => chunk.requestRebuild());
        }
    }

    public getBlock([x, y, z]: Vector3Tuple): Block | undefined {
        if (!this.blockData) {
            return undefined;
        }

        const index = xyzTupelToIndex(x, y, z, CHUNK_WIDTH, CHUNK_WIDTH);
        if (index < 0 || index >= this.blockData!.length) {
            return undefined;
        }

        return Blocks.getBlockById(this.blockData![index]);
    }

    public setBlockState([x, y, z]: Vector3Tuple, state: BlockState): void {
        this.blockStates.set(xyzTupelToIndex(x, y, z, CHUNK_WIDTH, CHUNK_WIDTH), state);
        this.requestRebuild();
    }

    public getBlockState([x, y, z]: Vector3Tuple): BlockState | undefined {
        return this.blockStates.get(xyzTupelToIndex(x, y, z, CHUNK_WIDTH, CHUNK_WIDTH));
    }

    public setBlockData(blockData: Uint8Array): void {
        this.blockData = blockData;
    }

    public getBlockData() {
        return this.blockData;
    }

    public enableRebuilds() {
        this.rebuildsEnabled = true;
    }

    public calculateLight(testPoint: BlockPos) {
        // floodFillBlockLightAdditive(this.skyLightMap, this.blockData, modifyBlockPosValues(testPoint, (v) => mod(v, 16)), 15);
        // console.log(this.skyLightMap)

        // // this.solidMesh.geometry.attributes.skylight = 1; // = this.skyLightMap; // .getAttribute('skylight').;
        // this.solidMesh.geometry.setAttribute('skylight', new BufferAttribute(this.skyLightMap, 1));
        // this.solidMesh.geometry.attributes.position.needsUpdate = true;
    }
}
