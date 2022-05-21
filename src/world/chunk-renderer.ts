import { Vector3 } from "three";
import { BlockFace } from "../block/block-face";
import { BlockModelRenderer, SolidityMap } from "../block/block-model/block-model-renderer";
import type { SerializedBlockModels } from "../block/blocks";
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

export interface ChunkBlockData {
    blocks: Uint8Array;
    neighborBlocks: Uint8Array[];
    blockModelIndices: Record<number, number | undefined>;
}

const BLOCK_FACE_NORMAL = {
    [BlockFace.TOP]: new Vector3(0, 1, 0),
    [BlockFace.BOTTOM]: new Vector3(0, -1, 0),
    [BlockFace.LEFT]: new Vector3(1, 0, 0),
    [BlockFace.RIGHT]: new Vector3(-1, 0, 0),
    [BlockFace.FRONT]: new Vector3(0, 0, 1),
    [BlockFace.BACK]: new Vector3(0, 0, -1),
} as const;

type IsVisible = (blockId: number) => boolean;

export class ChunkRenderer {
    public constructor(private readonly blockModels: SerializedBlockModels) {}

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
    public buildGeometry(
        blockData: ChunkBlockData,
    ): BuildGeometryResult {
        // TODO: Don't hard-code visibility of blocks but define it in the block model.
        // TODO: Can the solid & transparent meshes be merged into one mesh?
        // TODO: Is there a need for block models being included in two meshes? E.g. solid cauldron with water?
        return {
            solid: this.buildGeometryWithOptions(
                blockData,
                (blockId) => [1, 2, 3, 4, 5].includes(blockId),
            ),
            water: this.buildGeometryWithOptions(
                // There currently is no water.
                blockData,
                (blockId) => false,
            ),
            transparent: this.buildGeometryWithOptions(
                // There currently are no transparent blocks.
                blockData,
                (blockId) => blockId === 6,
            ),
        };
    }

    private buildGeometryWithOptions(blockData: ChunkBlockData, isVisible: IsVisible): ChunkMeshData {
        const partialChunkMeshData: PartialChunkMeshData = {
            normals: [],
            triangles: [],
            uv: [],
            vertices: [],
        };
        for (let i = 0; i < blockData.blocks.length; i += 1) {
            const pos = indexToXZY(i, CHUNK_WIDTH, CHUNK_WIDTH);
            if (!isVisible(blockData.blocks[i])) {
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

    private renderBlock(blockData: ChunkBlockData, position: Vector3, partialChunkMeshData: PartialChunkMeshData, isVisible: IsVisible) {
        const blockDataBlocksIndex = xzyToIndex(position, CHUNK_WIDTH, CHUNK_WIDTH);
        const blockId = blockData.blocks[blockDataBlocksIndex];

        // TODO: Don't recreate the block model renderer for each block.
        const modelRenderer = new BlockModelRenderer(this.blockModels.textureUvs);
        const solidityMap: SolidityMap = {
            [BlockFace.TOP]: !this.isFaceVisible(blockData, position, BlockFace.TOP, isVisible),
            [BlockFace.BOTTOM]: !this.isFaceVisible(blockData, position, BlockFace.BOTTOM, isVisible),
            [BlockFace.LEFT]: !this.isFaceVisible(blockData, position, BlockFace.LEFT, isVisible),
            [BlockFace.RIGHT]: !this.isFaceVisible(blockData, position, BlockFace.RIGHT, isVisible),
            [BlockFace.FRONT]: !this.isFaceVisible(blockData, position, BlockFace.FRONT, isVisible),
            [BlockFace.BACK]: !this.isFaceVisible(blockData, position, BlockFace.BACK, isVisible),
        };

        // TODO: Only render block models once and translate the vertices to the correct position.
        const modelIndex = blockData.blockModelIndices[blockDataBlocksIndex] ?? 0;
        const modelMesh = modelRenderer.render(position, this.blockModels.blockModels[blockId][modelIndex], solidityMap);
        partialChunkMeshData.normals.push(...modelMesh.normals);
        partialChunkMeshData.uv.push(...modelMesh.uv);

        // This is probably not the nicest way to do this, but it works for now. Its purpose is to preserve
        // the correct triangle numbering for small meshes being merged into a big one while the small meshes
        // base the triangle index on 0.
        const numberOfVertices = (partialChunkMeshData.vertices.length / 3);
        for (let i = 0; i < modelMesh.triangles.length / 6; i++) {
            for (let j = 0; j < 6; j++) {
                partialChunkMeshData.triangles.push(
                    modelMesh.triangles[i * 6 + j] + numberOfVertices,
                );
            }
        }

        partialChunkMeshData.vertices.push(...modelMesh.vertices);
    }

    private isFaceVisible(blockData: ChunkBlockData, position: Vector3, face: BlockFace, isVisible: IsVisible): boolean {
        const neighbor = this.getBlock(blockData, position.clone().add(BLOCK_FACE_NORMAL[face]));

        // TODO: Take into account which block is currently rendered to determine if the face is visible. Otherwise
        // transparent blocks wouldn't render adjacent faces despite them being different block types.
        return !isVisible(neighbor);
    }

    private getBlock({ blocks, neighborBlocks }: ChunkBlockData, position: Vector3): number {
        // Above
        if (position.y >= CHUNK_HEIGHT) {
            return neighborBlocks[0][xzyToIndex(
                new Vector3(position.x, mod(position.y, CHUNK_HEIGHT), position.z),
                CHUNK_WIDTH,
                CHUNK_WIDTH,
            )];
        }

        // Below
        if (position.y < 0) {
            return neighborBlocks[1][xzyToIndex(
                new Vector3(position.x, mod(position.y, CHUNK_HEIGHT), position.z),
                CHUNK_WIDTH,
                CHUNK_WIDTH,
            )];
        }

        // Left
        if (position.x < 0) {
            return neighborBlocks[2][xzyToIndex(
                new Vector3(mod(position.x, CHUNK_WIDTH), position.y, position.z),
                CHUNK_WIDTH,
                CHUNK_WIDTH,
            )];
        }

        // Right
        if (position.x >= CHUNK_WIDTH) {
            return neighborBlocks[3][xzyToIndex(
                new Vector3(mod(position.x, CHUNK_WIDTH), position.y, position.z),
                CHUNK_WIDTH,
                CHUNK_WIDTH,
            )];
        }

        // Back
        if (position.z < 0) {
            return neighborBlocks[4][xzyToIndex(
                new Vector3(position.x, position.y, mod(position.z, CHUNK_WIDTH)),
                CHUNK_WIDTH,
                CHUNK_WIDTH,
            )];
        }

        // Front
        if (position.z >= CHUNK_WIDTH) {
            return neighborBlocks[5][xzyToIndex(
                new Vector3(position.x, position.y, mod(position.z, CHUNK_WIDTH)),
                CHUNK_WIDTH,
                CHUNK_WIDTH,
            )];
        }

        // Within
        return blocks[xzyToIndex(position, CHUNK_WIDTH, CHUNK_WIDTH)];
    }
}
