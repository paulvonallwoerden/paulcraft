import { BufferAttribute, BufferGeometry, Euler, Matrix4, Quaternion, Vector3 } from "three";
import { BlockFace } from "../block/block-face";
import type { SerializedBlockUvs } from "../block/blocks";
import { indexToXZY, xzyToIndex } from "../util/index-to-vector3";

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

    public buildGeometry(blockData: Uint8Array): ChunkMeshData {
        const partialChunkMeshData: PartialChunkMeshData = {
            normals: [],
            triangles: [],
            uv: [],
            vertices: [],
        };
        for (let i = 0; i < blockData.length; i += 1) {
            if (blockData[i] === 0) {
                continue;
            }

            this.renderBlock(blockData, indexToXZY(i, CHUNK_WIDTH, CHUNK_WIDTH), partialChunkMeshData);
        }

        return {
            vertices: new Float32Array(partialChunkMeshData.vertices),
            triangles: partialChunkMeshData.triangles,
            normals: new Float32Array(partialChunkMeshData.normals),
            uv: new Float32Array(partialChunkMeshData.uv),
        };

        // const geometry = new BufferGeometry();
        // const { normals, triangles, uv, vertices } = partialChunkMeshData;
        // geometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3));
        // geometry.setAttribute('normal', new BufferAttribute(new Float32Array(normals), 3));
        // geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uv), 2));
        // geometry.setIndex(triangles);

        // return geometry;
    }

    private renderBlock(blockData: Uint8Array, position: Vector3, partialChunkMeshData: PartialChunkMeshData) {
        this.renderBlockFaceIfVisible(blockData, position, BlockFace.TOP, partialChunkMeshData);
        this.renderBlockFaceIfVisible(blockData, position, BlockFace.BOTTOM, partialChunkMeshData);
        this.renderBlockFaceIfVisible(blockData, position, BlockFace.LEFT, partialChunkMeshData);
        this.renderBlockFaceIfVisible(blockData, position, BlockFace.RIGHT, partialChunkMeshData);
        this.renderBlockFaceIfVisible(blockData, position, BlockFace.FRONT, partialChunkMeshData);
        this.renderBlockFaceIfVisible(blockData, position, BlockFace.BACK, partialChunkMeshData);
    }

    private renderBlockFaceIfVisible(
        blockData: Uint8Array,
        position: Vector3,
        direction: BlockFace,
        partialChunkMeshData: PartialChunkMeshData,
    ): void {
        if (!this.isFaceVisible(blockData, position, direction)) {
            return;
        }

        const blockId = blockData[xzyToIndex(position, CHUNK_WIDTH, CHUNK_WIDTH)];
        this.renderBlockFace(blockId, direction, position, partialChunkMeshData);
    }

    private isFaceVisible(blockData: Uint8Array, position: Vector3, face: BlockFace): boolean {
        return this.isTransparentBlock(
            blockData,
            position.clone().add(BLOCK_FACE_NORMAL[face]),
        );
    }

    private isTransparentBlock(blockData: Uint8Array, position: Vector3): boolean {
        if (position.x < 0 || position.y < 0 || position.z < 0) {
            return true;
        }

        if (position.x >= CHUNK_WIDTH || position.y >= CHUNK_HEIGHT || position.z >= CHUNK_WIDTH) {
            return true;
        }

        return blockData[xzyToIndex(position, CHUNK_WIDTH, CHUNK_WIDTH)] == 0;
    }

    public renderBlockFace(
        blockId: number,
        direction: BlockFace,
        additionalTranslation: Vector3,
        partialChunkMeshData: PartialChunkMeshData,
    ): void {
        const rts = ChunkRenderer.blockFaceTRSMatrices[direction];
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
