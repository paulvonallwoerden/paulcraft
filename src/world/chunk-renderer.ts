import { BufferAttribute, BufferGeometry, Euler, Matrix4, Quaternion, Vector3 } from "three";
import { BlockFace } from "../block/block-face";
import { AIR_BLOCK_ID, GLASS_BLOCK_ID, SUGAR_CANE_BLOCK_ID, WATER_BLOCK_ID } from "../block/block-ids";
import type { SerializedBlockUvs } from "../block/blocks";
import { indexToXZY, xzyToIndex } from "../util/index-to-vector3";
import { mod } from "../util/mod";

const CHUNK_HEIGHT = 16;
const CHUNK_WIDTH = 16;

interface PartialChunkMeshData {
    vertices: number[];
    triangles: number[];
    normals: number[];
    uv: number[];
}

export interface ChunkMeshData {
    vertices: Float32Array;
    triangles: number[];
    normals: Float32Array;
    uv: Float32Array;
}

export interface BuildGeometryResult {
    solid: ChunkMeshData;
    water: ChunkMeshData;
    transparent: ChunkMeshData;
}

const BLOCK_FACE_NORMAL = {
    [BlockFace.TOP]: new Vector3(0, 1, 0),
    [BlockFace.BOTTOM]: new Vector3(0, -1, 0),
    [BlockFace.LEFT]: new Vector3(1, 0, 0),
    [BlockFace.RIGHT]: new Vector3(-1, 0, 0),
    [BlockFace.FRONT]: new Vector3(0, 0, 1),
    [BlockFace.BACK]: new Vector3(0, 0, -1),
} as const;

function degToRad(deg: number): number {
    return deg * (Math.PI / 180);
}

type IsVisible = (blockId: number) => boolean;

export class ChunkRenderer {
    private static readonly blockFaceTRSMatrices: Record<BlockFace, Matrix4> = {
        [BlockFace.TOP]: new Matrix4().compose(
            new Vector3(0, 1, 1),
            new Quaternion().setFromEuler(new Euler(degToRad(-90), 0, 0), true),
            new Vector3(1, 1, 1),
        ),
        [BlockFace.BOTTOM]: new Matrix4().compose(
            new Vector3(0, 0, 0),
            new Quaternion().setFromEuler(new Euler(degToRad(90), 0, 0), true),
            new Vector3(1, 1, 1),
        ),
        [BlockFace.LEFT]: new Matrix4().compose(
            new Vector3(1, 0, 1),
            new Quaternion().setFromEuler(new Euler(0, degToRad(90), 0), true),
            new Vector3(1, 1, 1),
        ),
        [BlockFace.RIGHT]: new Matrix4().compose(
            new Vector3(0, 0, 0),
            new Quaternion().setFromEuler(new Euler(0, degToRad(-90), 0), true),
            new Vector3(1, 1, 1),
        ),
        [BlockFace.FRONT]: new Matrix4().compose(
            new Vector3(0, 0, 1),
            new Quaternion().identity(),
            new Vector3(1, 1, 1),
        ),
        [BlockFace.BACK]: new Matrix4().compose(
            new Vector3(1, 0, 0),
            new Quaternion().setFromEuler(new Euler(0, degToRad(180), 0), true),
            new Vector3(1, 1, 1),
        ),
    };

    public constructor(private readonly blockUvs: SerializedBlockUvs) {}

    /**
     * blockData
     * center
     * top
     * bottom
     * north
     * east
     * south
     * west
     */
    public buildGeometry(blockData: Uint8Array[]): BuildGeometryResult {
        return {
            solid: this.buildGeometryWithOptions(
                blockData,
                (blockId) => blockId !== AIR_BLOCK_ID && blockId !== GLASS_BLOCK_ID && blockId !== SUGAR_CANE_BLOCK_ID && blockId !== WATER_BLOCK_ID,
            ),
            water: this.buildGeometryWithOptions(
                blockData,
                (blockId) => blockId === WATER_BLOCK_ID,
            ),
            transparent: this.buildGeometryWithOptions(
                blockData,
                (blockId) => blockId === GLASS_BLOCK_ID || blockId === SUGAR_CANE_BLOCK_ID,
            ),
        };
    }

    private buildGeometryWithOptions(blockData: Uint8Array[], isVisible: IsVisible): ChunkMeshData {
        const partialChunkMeshData: PartialChunkMeshData = {
            normals: [],
            triangles: [],
            uv: [],
            vertices: [],
        };
        for (let i = 0; i < blockData[0].length; i += 1) {
            const pos = indexToXZY(i, CHUNK_WIDTH, CHUNK_WIDTH);
            if (!isVisible(blockData[0][i])) {
                continue;
            }

            this.renderBlock(
                blockData,
                pos,
                partialChunkMeshData,
                isVisible,
            );
        }

        return {
            vertices: new Float32Array(partialChunkMeshData.vertices),
            triangles: partialChunkMeshData.triangles,
            normals: new Float32Array(partialChunkMeshData.normals),
            uv: new Float32Array(partialChunkMeshData.uv),
        };
    }

    private renderBlock(blockData: Uint8Array[], position: Vector3, partialChunkMeshData: PartialChunkMeshData, isVisible: IsVisible) {
        const blockId = blockData[0][xzyToIndex(position, CHUNK_WIDTH, CHUNK_WIDTH)];
        if (blockId !== SUGAR_CANE_BLOCK_ID) {
            this.renderBlockFaceIfVisible(blockData, position, BlockFace.TOP, partialChunkMeshData, isVisible);
            this.renderBlockFaceIfVisible(blockData, position, BlockFace.BOTTOM, partialChunkMeshData, isVisible);
            this.renderBlockFaceIfVisible(blockData, position, BlockFace.LEFT, partialChunkMeshData, isVisible);
            this.renderBlockFaceIfVisible(blockData, position, BlockFace.RIGHT, partialChunkMeshData, isVisible);
            this.renderBlockFaceIfVisible(blockData, position, BlockFace.FRONT, partialChunkMeshData, isVisible);
            this.renderBlockFaceIfVisible(blockData, position, BlockFace.BACK, partialChunkMeshData, isVisible);
        } else {
            this.renderSugarCane(position, partialChunkMeshData);
        }
    }

    private renderBlockFaceIfVisible(
        blockData: Uint8Array[],
        position: Vector3,
        direction: BlockFace,
        partialChunkMeshData: PartialChunkMeshData,
        isVisible: IsVisible,
    ): void {
        if (!this.isFaceVisible(blockData, position, direction, isVisible)) {
            return;
        }

        const blockId = blockData[0][xzyToIndex(position, CHUNK_WIDTH, CHUNK_WIDTH)];
        this.renderBlockFace(blockId, direction, position, partialChunkMeshData);
    }

    private renderSugarCane(
        position: Vector3,
        partialChunkMeshData: PartialChunkMeshData,
    ): void {
        partialChunkMeshData.vertices.push(
            ...new Vector3(0.15, 0, 0.15).add(position).toArray(),
        );
        partialChunkMeshData.vertices.push(
            ...new Vector3(0.85, 0, 0.85).add(position).toArray(),
        );
        partialChunkMeshData.vertices.push(
            ...new Vector3(0.15, 1, 0.15).add(position).toArray(),
        );
        partialChunkMeshData.vertices.push(
            ...new Vector3(0.85, 1, 0.85).add(position).toArray(),
        );

        partialChunkMeshData.vertices.push(
            ...new Vector3(0.85, 0, 0.15).add(position).toArray(),
        );
        partialChunkMeshData.vertices.push(
            ...new Vector3(0.15, 0, 0.85).add(position).toArray(),
        );
        partialChunkMeshData.vertices.push(
            ...new Vector3(0.85, 1, 0.15).add(position).toArray(),
        );
        partialChunkMeshData.vertices.push(
            ...new Vector3(0.15, 1, 0.85).add(position).toArray(),
        );

        const triangleOffset = (partialChunkMeshData.vertices.length / 3) - 8;
        partialChunkMeshData.triangles.push(
            triangleOffset,
            triangleOffset + 1,
            triangleOffset + 2,

            triangleOffset + 2,
            triangleOffset + 1,
            triangleOffset + 3,

            triangleOffset + 4,
            triangleOffset + 5,
            triangleOffset + 6,

            triangleOffset + 6,
            triangleOffset + 5,
            triangleOffset + 7,
        );

        const normalsArray = [0, 0, 1];
        for (let i = 0; i < 8; i++) {
            partialChunkMeshData.normals.push(...normalsArray);
        }

        partialChunkMeshData.uv.push(...this.blockUvs[SUGAR_CANE_BLOCK_ID][BlockFace.FRONT]);
        partialChunkMeshData.uv.push(...this.blockUvs[SUGAR_CANE_BLOCK_ID][BlockFace.FRONT]);
    }

    private isFaceVisible(blockData: Uint8Array[], position: Vector3, face: BlockFace, isVisible: IsVisible): boolean {
        const neighbor = this.getBlock(blockData, position.clone().add(BLOCK_FACE_NORMAL[face]));

        return !isVisible(neighbor) || (this.isTransparent(neighbor) && blockData[0][xzyToIndex(position, CHUNK_WIDTH, CHUNK_WIDTH)] !== neighbor)
    }

    private getBlock(blockData: Uint8Array[], position: Vector3): number {
        // Above
        if (position.y >= CHUNK_HEIGHT) {
            return blockData[1][xzyToIndex(
                new Vector3(position.x, mod(position.y, CHUNK_HEIGHT), position.z),
                CHUNK_WIDTH,
                CHUNK_WIDTH,
            )];
        }

        // Below
        if (position.y < 0) {
            return blockData[2][xzyToIndex(
                new Vector3(position.x, mod(position.y, CHUNK_HEIGHT), position.z),
                CHUNK_WIDTH,
                CHUNK_WIDTH,
            )];
        }

        // Left
        if (position.x < 0) {
            return blockData[3][xzyToIndex(
                new Vector3(mod(position.x, CHUNK_WIDTH), position.y, position.z),
                CHUNK_WIDTH,
                CHUNK_WIDTH,
            )];
        }

        // Right
        if (position.x >= CHUNK_WIDTH) {
            return blockData[4][xzyToIndex(
                new Vector3(mod(position.x, CHUNK_WIDTH), position.y, position.z),
                CHUNK_WIDTH,
                CHUNK_WIDTH,
            )];
        }

        // Back
        if (position.z < 0) {
            return blockData[5][xzyToIndex(
                new Vector3(position.x, position.y, mod(position.z, CHUNK_WIDTH)),
                CHUNK_WIDTH,
                CHUNK_WIDTH,
            )];
        }

        // Front
        if (position.z >= CHUNK_WIDTH) {
            return blockData[6][xzyToIndex(
                new Vector3(position.x, position.y, mod(position.z, CHUNK_WIDTH)),
                CHUNK_WIDTH,
                CHUNK_WIDTH,
            )];
        }

        // Within
        return blockData[0][xzyToIndex(position, CHUNK_WIDTH, CHUNK_WIDTH)];
    }

    private isTransparent(blockId: number): boolean {
        return [GLASS_BLOCK_ID, SUGAR_CANE_BLOCK_ID, WATER_BLOCK_ID].includes(blockId);
    }

    public renderBlockFace(
        blockId: number,
        direction: BlockFace,
        additionalTranslation: Vector3,
        partialChunkMeshData: PartialChunkMeshData,
    ): void {
        let rts = ChunkRenderer.blockFaceTRSMatrices[direction];
        if (blockId === WATER_BLOCK_ID && direction === BlockFace.TOP) {
            rts = new Matrix4().compose(
                new Vector3(0, 0.9, 1),
                new Quaternion().setFromEuler(new Euler(degToRad(-90), 0, 0), true),
                new Vector3(1, 1, 1),
            );
        }

        partialChunkMeshData.vertices.push(
            ...new Vector3(0, 0, 0).applyMatrix4(rts).add(additionalTranslation).toArray(),
        );
        partialChunkMeshData.vertices.push(
            ...new Vector3(1, 0, 0).applyMatrix4(rts).add(additionalTranslation).toArray(),
        );
        partialChunkMeshData.vertices.push(
            ...new Vector3(0, 1, 0).applyMatrix4(rts).add(additionalTranslation).toArray(),
        );
        partialChunkMeshData.vertices.push(
            ...new Vector3(1, 1, 0).applyMatrix4(rts).add(additionalTranslation).toArray(),
        );

        const triangleOffset = (partialChunkMeshData.vertices.length / 3) - 4;
        partialChunkMeshData.triangles.push(
            triangleOffset,
            triangleOffset + 1,
            triangleOffset + 2,

            triangleOffset + 2,
            triangleOffset + 1,
            triangleOffset + 3,
        );

        const normalsArray = BLOCK_FACE_NORMAL[direction].toArray();
        for (let i = 0; i < 4; i++) {
            partialChunkMeshData.normals.push(...normalsArray);
        }

        partialChunkMeshData.uv.push(...this.blockUvs[blockId][direction]);
    }
}
