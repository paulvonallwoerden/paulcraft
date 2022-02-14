import { BufferAttribute, BufferGeometry, DoubleSide, Material, Mesh, MeshStandardMaterial, Scene, Vector3, Vector3Tuple } from "three";
import { Game } from "../game";
import { xyzTupelToIndex, xzyToIndex } from "../util/index-to-vector3";
import { ChunkMeshData } from "./chunk-renderer";
import SimplexNoise from 'simplex-noise';
import { OakTreeFeature } from "./feature/oak-tree-feature";
import { WorldFeatureBuilder } from "./feature/world-feature";
import { ITickable } from "../tickable";
import { STONE_BLOCK_ID } from "../block/block-ids";
import { ChunkColumn } from "./chunk-column";

export const CHUNK_WIDTH = 16;
export const CHUNK_HEIGHT = 16;

export class Chunk implements ITickable {
    public isGenerated = false;
    public isBlockDataDirty = false;
    public shouldRebuild = false;

    private blockData: Uint8Array = new Uint8Array(CHUNK_WIDTH * CHUNK_WIDTH * CHUNK_HEIGHT);
    private isWaitingForBlockData = false;
    private isWaitingForGeometryData = false;
    private timeSinceFirstRender = -1;

    public readonly solidMesh: Mesh;
    public readonly waterMesh: Mesh;
    public readonly transparentMesh: Mesh;

    public constructor(
        private readonly chunkColumn: ChunkColumn,
        private readonly position: Vector3,
    ) {
        const chunkMaterial = new MeshStandardMaterial({
            map: Game.main.blocks.getBlockTexture(),
            opacity: 0,
            transparent: true,
        });
        this.solidMesh = new Mesh(undefined, chunkMaterial);

        const waterMaterial = new MeshStandardMaterial({
            map: Game.main.blocks.getBlockTexture(),
            opacity: 0.8,
            transparent: true,
        });
        this.waterMesh = new Mesh(undefined, waterMaterial);

        const transparentMaterial = new MeshStandardMaterial({
            map: Game.main.blocks.getBlockTexture(),
            alphaTest: 0.5,
        });
        this.transparentMesh = new Mesh(undefined, transparentMaterial);
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
        scene.remove(this.solidMesh);
        scene.remove(this.waterMesh);
        scene.remove(this.transparentMesh);
    }

    public generateTerrain() {
        this.generateBlocks();
    }

    public onTick(deltaTime: number): void {
        this.waitForBlockData();
        // this.waitForGeometryData();
    }

    public lateUpdate(deltaTime: number) {
        if (this.isBlockDataDirty || this.shouldRebuild) {
            this.isBlockDataDirty = false;
            this.shouldRebuild = false;
            this.buildMesh();
        }

        if (!Array.isArray(this.solidMesh.material)) {
            if (this.timeSinceFirstRender >= 0 && this.solidMesh.material.transparent) {
                this.timeSinceFirstRender += deltaTime;
                this.solidMesh.material.opacity = this.timeSinceFirstRender / 1000;
                this.solidMesh.material.transparent = this.timeSinceFirstRender < 1000;
            }
        }
    }

    public tickBlocks() {
        for (let i = 0; i < 10; i++) {
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
        const block = Game.main.blocks.getBlockById(blockId);
        if (!block) return;
        block.onTick(Game.main.level, {
            x: blockPos.x + this.position.x * CHUNK_WIDTH,
            y: blockPos.y + this.position.y * CHUNK_HEIGHT,
            z: blockPos.z + this.position.z * CHUNK_WIDTH,
        });
    }

    private waitForBlockData() {
        if (!this.isWaitingForBlockData) {
            return;
        }

        const newBlockData = Game.main.getMaybeChunkData(this.position);
        if (!newBlockData) {
            return;
        }

        this.blockData = newBlockData;
        this.isBlockDataDirty = true;

        this.isWaitingForBlockData = false;
    }

    private waitForGeometryData() {
        if (!this.isWaitingForGeometryData) {
            return;
        }

        const newGeometryData = Game.main.getMaybeChunkGeometry(this.position);
        if (!newGeometryData) {
            return;
        }

        // this.renderMeshFromChunkMeshData(this.solidMesh, newGeometryData.solid);
        // this.renderMeshFromChunkMeshData(this.transparentMesh, newGeometryData.transparent);
        // this.isWaitingForGeometryData = false;
    }

    private buildMesh() {
        const blockData: Uint8Array[] = [this, ...this.getNeighborChunks()].map((chunk) => chunk?.blockData ?? new Uint8Array());

        Game.main.chunkGeometryBuilderPool.buildGeometry(blockData).then((geometry) => {
            this.solidMesh.geometry = geometry.solid;
            this.waterMesh.geometry = geometry.water;
            this.transparentMesh.geometry = geometry.transparent;

            if (this.timeSinceFirstRender < 0) {
                this.timeSinceFirstRender = 0;
            }
        });
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

    public setBlock([x, y, z]: Vector3Tuple, blockId: number) {
        this.blockData[xyzTupelToIndex(x, y, z, CHUNK_WIDTH, CHUNK_WIDTH)] = blockId;
        this.isBlockDataDirty = true;

        // TODO: Only update the relevant chunk
        if (x <= 0 || y <= 0 || z <= 0 || x >= CHUNK_WIDTH - 1 || y >= CHUNK_HEIGHT - 1 || z >= CHUNK_WIDTH - 1) {
            this.getNeighborChunks().forEach((chunk) => chunk ? chunk.shouldRebuild = true : null);
        }
    }

    public getBlock([x, y, z]: Vector3Tuple): number | undefined {
        if (!this.blockData) {
            return undefined;
        }

        const index = xyzTupelToIndex(x, y, z, CHUNK_WIDTH, CHUNK_WIDTH);
        if (index < 0 || index >= this.blockData!.length) {
            return undefined;
        }

        return this.blockData![index];
    }

    private generateBlocks() {
        Game.main.generateChunkData(this.position);
        this.isWaitingForBlockData = true;
    }
}
