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
    public buildGeometry(blockData: Uint8Array[]): BuildGeometryResult {
        // TODO: Don't hard-code visibility of blocks but define it in the block model.
        // TODO: Can the solid & transparent meshes be merged into one mesh?
        // TODO: Is there a need for block models being included in two meshes? E.g. solid cauldron with water?
        return {
            solid: this.buildGeometryWithOptions(
                blockData,
                (blockId) => [1, 2, 3, 4, 5].includes(blockId),
            ),
            water: this.buildGeometryWithOptions(
                blockData,
                // There currently is no water.
                (blockId) => false,
            ),
            transparent: this.buildGeometryWithOptions(
                blockData,
                // There currently are no transparent blocks.
                (blockId) => false,
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

        // TODO: Don't use a random model but use the block model returned by the Block::getBlockModel() method.
        const posHash = 137 * position.x + 149 * position.y + 163 * position.z;
        const numberOfModels = this.blockModels.blockModels[blockId].length;
        const modelIndex = mod(posHash, numberOfModels);

        // TODO: Only render block models once and translate the vertices to the correct position.
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

    private isFaceVisible(blockData: Uint8Array[], position: Vector3, face: BlockFace, isVisible: IsVisible): boolean {
        const neighbor = this.getBlock(blockData, position.clone().add(BLOCK_FACE_NORMAL[face]));

        // TODO: Take into account which block is currently rendered to determine if the face is visible. Otherwise
        // transparent blocks wouldn't render adjacent faces despite them being different block types.
        return !isVisible(neighbor);
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
}
