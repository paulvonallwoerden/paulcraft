import { BufferAttribute, Mesh, Scene, Vector3, Vector3Tuple } from 'three';
import { Game } from '../game';
import { indexToPos, posToIndex, xyzTupelToIndex, xzyToIndex } from '../util/index-to-vector3';
import { ITickable } from '../tickable';
import { ChunkColumn } from './chunk-column';
import { Blocks } from '../block/blocks';
import { Block } from '../block/block';
import { BlockState } from '../block/block-state/block-state';
import { BlockPos, sumBlockPos } from '../block/block-pos';
import { manhattenDistance } from '../light/flood-fill';
import { areBlockLightPropertiesEqual } from '../light/are-block-light-properties-equal';
import { BlockFaces, normalByBlockFace } from '../block/block-face';

export const CHUNK_WIDTH = 16;
export const CHUNK_HEIGHT = 16;

export class Chunk implements ITickable {
    private shouldRebuild = false;
    private rebuildsEnabled = false;

    private blockData: Uint8Array = new Uint8Array(CHUNK_WIDTH * CHUNK_WIDTH * CHUNK_HEIGHT);
    private blockStates: Map<number, BlockState> = new Map();

    private skyLight: Uint8Array = new Uint8Array(CHUNK_WIDTH * CHUNK_WIDTH * CHUNK_HEIGHT);
    private blockLight: Uint8Array = new Uint8Array(CHUNK_WIDTH * CHUNK_WIDTH * CHUNK_HEIGHT);

    public readonly solidMesh: Mesh;
    public readonly waterMesh: Mesh;
    public readonly transparentMesh: Mesh;

    public constructor(
        public readonly column: ChunkColumn,
        public readonly position: Vector3,
    ) {
        const { solid, transparent, water } = Game.main.blocks.getBlockMaterials();
        this.solidMesh = new Mesh(undefined, solid);
        this.transparentMesh = new Mesh(undefined, transparent);
        this.waterMesh = new Mesh(undefined, water);
    }

    public register(scene: Scene) {
        const worldPosition = this.position.clone().multiply(new Vector3(CHUNK_WIDTH, CHUNK_HEIGHT, CHUNK_WIDTH));
        this.solidMesh.position.set(worldPosition.x, worldPosition.y, worldPosition.z);
        this.waterMesh.position.set(worldPosition.x, worldPosition.y, worldPosition.z);
        this.transparentMesh.position.set(worldPosition.x, worldPosition.y, worldPosition.z);
        scene.add(this.solidMesh);
        scene.add(this.waterMesh);
        scene.add(this.transparentMesh);
    }

    public unregister(scene: Scene) {
        if (this.solidMesh?.geometry) this.solidMesh.geometry.dispose();
        if (this.waterMesh?.geometry) this.waterMesh.geometry.dispose();
        if (this.transparentMesh?.geometry) this.transparentMesh.geometry.dispose();

        scene.remove(this.solidMesh);
        scene.remove(this.waterMesh);
        scene.remove(this.transparentMesh);
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
        const spilledBlockData = this.column.getSpilledBlockData();
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

        const geometry = await Game.main.chunkGeometryBuilderPool.buildGeometry(
            this.position,
            {
                blockModelIndices,
                blocks: this.blockData,
                neighborBlocks: this.getNeighborChunkBlocks(),
                skyLight: this.skyLight, // this.column.getSkyLight(),
                blockLight: this.blockLight,
                light: this.getLightData(),
                neighborLight: BlockFaces
                    .map((face) => normalByBlockFace(face))
                    .map((offset) => sumBlockPos(this.position, offset))
                    .map((pos) => this.column.getChunk([pos.x, pos.y, pos.z])?.getLightData()),
            },
        );
        this.solidMesh.geometry = geometry.solid;
        this.waterMesh.geometry = geometry.water;
        this.transparentMesh.geometry = geometry.transparent;
    }

    private getSixNeighborChunks(): (Chunk | undefined)[] {
        return [{ x: 1, y: 0, z: 0 }, { x: -1, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: -1 }, { x: 0, y: 1, z: 0 }, { x: 0, y: -1, z: 0}].map(
            (offset) => this.column.getChunk([this.position.x + offset.x, this.position.y + offset.y, this.position.z + offset.z]),
        );
    }

    private getNeighborChunkBlocks(): Uint8Array[] {
        const neighborBlockData = [];
        for (let i = 0; i < 3 * 3 * 3; i++) {
            const pos = sumBlockPos(indexToPos(i, 3), { x: this.position.x - 1, y: this.position.y - 1, z: this.position.z - 1 });
            const chunk = this.column.getChunk([pos.x, pos.y, pos.z]);
            neighborBlockData.push(chunk?.getBlockData() ?? new Uint8Array());
        }

        return neighborBlockData;
    }

    private getNeighborChunks(maxDistance = 3, skipUnloaded = true): Chunk[] {
        const neighborChunks = [];
        for (let i = 0; i < 3 * 3 * 3; i++) {
            const relativePos = indexToPos(i, 3);
            const distance = manhattenDistance(relativePos, { x: 1, y: 1, z: 1 });
            if (distance > maxDistance || distance === 0) {
                continue;
            }

            const pos = sumBlockPos(relativePos, { x: this.position.x - 1, y: this.position.y - 1, z: this.position.z - 1 });
            const chunk = this.column.getChunk([pos.x, pos.y, pos.z]);
            if (!chunk) {
                continue;
            }

            neighborChunks.push(chunk);
        }

        return neighborChunks;
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
        const oldBlock = Blocks.getBlockById(oldBlockId);
        // if (!areBlockLightPropertiesEqual(block, oldBlock)) {
            // this.getNeighborChunks().forEach((chunk) => chunk.requestRebuild());
        
        if(x <= 0 || y <= 0 || z <= 0 || x >= CHUNK_WIDTH - 1 || y >= CHUNK_HEIGHT - 1 || z >= CHUNK_WIDTH - 1) {
            this.getNeighborChunks(1).forEach((chunk) => chunk.requestRebuild());
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

    public setBlockLight(pos: BlockPos, lightLevel: number): void {
        this.blockLight[posToIndex(pos)] = lightLevel;
        this.requestRebuild();
    }

    public getBlockLight(pos: BlockPos): number {
        return this.blockLight[posToIndex(pos)];
    }

    public setSkyLight(pos: BlockPos, lightLevel: number): void {
        this.skyLight[posToIndex(pos)] = lightLevel;
        this.requestRebuild();
    }

    public getSkyLight(pos: BlockPos): number {
        return this.skyLight[posToIndex(pos)];
    }

    public getLightData() {
        return {
            block: this.blockLight,
            sky: this.skyLight,
        };
    }
}
