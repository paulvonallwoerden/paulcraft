import { BufferAttribute, BufferGeometry, Mesh, MeshStandardMaterial, Scene, Vector3, Vector3Tuple } from "three";
import { Game } from "../game";
import { xyzTupelToIndex } from "../util/index-to-vector3";
import { ChunkMeshData } from "./chunk-renderer";
import SimplexNoise from 'simplex-noise';
import { OakTreeFeature } from "./feature/oak-tree-feature";
import { WorldFeatureBuilder } from "./feature/world-feature";
import { ITickable } from "../tickable";

export const CHUNK_WIDTH = 16;
export const CHUNK_HEIGHT = 16;

export class Chunk implements ITickable {
    public isGenerated = false;

    private blockData?: Uint8Array;
    private isWaitingForBlockData = false;
    private isWaitingForGeometryData = false;

    public readonly chunkMesh: Mesh;

    public constructor(
        private readonly scene: Scene,
        private readonly position: Vector3,
        private readonly simplexNoise: SimplexNoise,
    ) {
        const chunkMaterial = new MeshStandardMaterial({ map: Game.main.blocks.getBlockTexture() });
        this.chunkMesh = new Mesh(undefined, chunkMaterial);
        this.scene.add(this.chunkMesh);
    }

    public generateTerrain() {
        this.generateBlocks();
    }

    public onTick(deltaTime: number): void {
        this.waitForBlockData();
        this.waitForGeometryData();
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
        this.isWaitingForBlockData = false;
        this.isGenerated = true;
    }

    private waitForGeometryData() {
        if (!this.isWaitingForGeometryData) {
            return;
        }

        const newGeometryData = Game.main.getMaybeChunkGeometry(this.position);
        if (!newGeometryData) {
            return;
        }

        this.renderMeshFromChunkMeshData(newGeometryData);
        this.isWaitingForGeometryData = false;
    }

    public buildMesh() {
        Game.main.buildChunkGeometry(this.position, this.blockData!);
        this.isWaitingForGeometryData = true;
    }

    public setBlock([x, y, z]: Vector3Tuple, blockId: number, skipMeshUpdate = false) {
        this.blockData![xyzTupelToIndex(x, y, z, CHUNK_WIDTH, CHUNK_WIDTH)] = blockId;

        if (!skipMeshUpdate) {
            this.buildMesh();
        }
    }

    public getBlock([x, y, z]: Vector3Tuple): number | undefined {
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

    private generateFeatures() {
        const featureBuilder: WorldFeatureBuilder = {
            setBlock: ([x, y, z], blockId) => this.blockData![xyzTupelToIndex(x, y, z, CHUNK_WIDTH, CHUNK_WIDTH)] = blockId,
        };

        if (this.position.y === 0) {
            const oakTreeFeature = new OakTreeFeature();
            oakTreeFeature.place([8, 0, 8], featureBuilder)
        }
    }

    private renderMeshFromChunkMeshData(chunkMeshData: ChunkMeshData) {
        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new BufferAttribute(chunkMeshData.vertices, 3));
        geometry.setAttribute('normal', new BufferAttribute(chunkMeshData.normals, 3));
        geometry.setAttribute('uv', new BufferAttribute(chunkMeshData.uv, 2));
        geometry.setIndex(chunkMeshData.triangles);

        this.chunkMesh.geometry = geometry;

        const worldPosition = this.position.clone().multiply(new Vector3(CHUNK_WIDTH, CHUNK_HEIGHT, CHUNK_WIDTH));
        this.chunkMesh.position.set(worldPosition.x, worldPosition.y, worldPosition.z);
    }
}
