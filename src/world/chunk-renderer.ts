import { Vector3 } from "three";
import { BlockFace } from "../block/block-face";
import { BlockModelRenderer, SolidityMap } from "../block/block-model/block-model-renderer";
import { BlockPos, isBlockPosIn, modifyBlockPosValues } from "../block/block-pos";
import { Blocks, SerializedBlockModels } from "../block/blocks";
import { floodFillBlockLightAdditive } from "../light/flood-fill";
import { indexToPos, indexToXZY, posToIndex, xyzTupelToIndex, xzyToIndex } from "../util/index-to-vector3";
import { mod } from "../util/mod";

const CHUNK_HEIGHT = 16;
const CHUNK_WIDTH = 16;

interface PartialChunkMeshData {
    vertices: number[];
    triangles: number[];
    normals: number[];
    uv: number[];

    skyLight: number[];
    blockLight: number[];
    foliage: number[];
}

export interface ChunkMeshData {
    vertices: Float32Array;
    triangles: number[];
    normals: Float32Array;
    uv: Float32Array;

    skyLight: Uint8Array;
    blockLight: Uint8Array;
    foliage: Uint8Array;
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
    skyLight: Uint8Array;
}

export interface ChunkBlockDataWithLight extends ChunkBlockData {
    blockLight: Uint8Array;
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
    public buildGeometry(chunkPosition: BlockPos, blockData: ChunkBlockData): BuildGeometryResult {
        // TODO: Don't hard-code visibility of blocks but define it in the block model.
        // TODO: Can the solid & transparent meshes be merged into one mesh?
        // TODO: Is there a need for block models being included in two meshes? E.g. solid cauldron with water?
        const blockLight = this.calculateBlockLight(blockData);
        const chunkBlockDataWithLight = { ...blockData, blockLight };

        return {
            solid: this.buildGeometryWithOptions(
                chunkPosition,
                chunkBlockDataWithLight,
                (blockId) => [1, 2, 3, 4, 5, 10, 11].includes(blockId),
            ),
            water: this.buildGeometryWithOptions(
                chunkPosition,
                // There currently is no water.
                chunkBlockDataWithLight,
                (blockId) => blockId === 7,
            ),
            transparent: this.buildGeometryWithOptions(
                chunkPosition,
                // There currently are no transparent blocks.
                chunkBlockDataWithLight,
                (blockId) => [6, 8, 9].includes(blockId),
            ),
        };
    }

    private calculateBlockLight(blockData: ChunkBlockData) {
        const blockLight = new Uint8Array(blockData.blocks.length);
        for (let i = 0; i < (16 * 3) * (16 * 3) * (16 * 3); i++) {
            const pos: BlockPos = modifyBlockPosValues(indexToPos(i, 16 * 3), (v) => v - 16);
            const block = Blocks.getBlockById(getBlockFromChunkBlockData(blockData, pos));
            const lightLevel = block.getLightLevel();
            if (lightLevel <= 0) {
                continue;
            }

            floodFillBlockLightAdditive(blockLight, pos, lightLevel, (pos) => (
                Blocks.getBlockById(getBlockFromChunkBlockData(blockData, pos)).blocksLight
            ));
        }

        return blockLight;
    }

    private buildGeometryWithOptions(chunkPosition: BlockPos, blockData: ChunkBlockDataWithLight, isVisible: IsVisible): ChunkMeshData {
        const partialChunkMeshData: PartialChunkMeshData = {
            vertices: [],
            normals: [],
            triangles: [],
            uv: [],
            skyLight: [],
            blockLight: [],
            foliage: [],
        };
        for (let i = 0; i < blockData.blocks.length; i += 1) {
            const pos = indexToXZY(i, CHUNK_WIDTH, CHUNK_WIDTH);
            if (!isVisible(blockData.blocks[i])) {
                continue;
            }

            this.renderBlock(
                chunkPosition,
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
            skyLight: new Uint8Array(partialChunkMeshData.skyLight),
            blockLight: new Uint8Array(partialChunkMeshData.blockLight),
            foliage: new Uint8Array(partialChunkMeshData.foliage),
        };
    }

    private renderBlock(
        chunkPosition: BlockPos,
        blockData: ChunkBlockDataWithLight,
        position: Vector3,
        partialChunkMeshData: PartialChunkMeshData,
        isVisible: IsVisible,
    ): void {
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

        /**
         * Lighting
         */
        for (let i = 0; i < modelMesh.vertices.length; i += 3 * 4) {
            const faceNormal = new Vector3(modelMesh.normals[i], modelMesh.normals[i + 1], modelMesh.normals[i + 2]);
            const faceMidPoint = new Vector3(
                modelMesh.vertices[i + 0] + modelMesh.vertices[i + 3] + modelMesh.vertices[i + 6] + modelMesh.vertices[i + 9],
                modelMesh.vertices[i + 1] + modelMesh.vertices[i + 4] + modelMesh.vertices[i + 7] + modelMesh.vertices[i + 10],
                modelMesh.vertices[i + 2] + modelMesh.vertices[i + 5] + modelMesh.vertices[i + 8] + modelMesh.vertices[i + 11],
            ).multiplyScalar(0.25);
            const samplePoint = faceMidPoint.add(faceNormal.multiplyScalar(0.5)).floor();

            const lightMapIndex = posToIndex(samplePoint);
            if (lightMapIndex >= 0 && lightMapIndex < blockData.blockLight.length) {
                const blockLight = blockData.blockLight[lightMapIndex];
                partialChunkMeshData.blockLight.push(blockLight, blockLight, blockLight, blockLight);
            } else {
                partialChunkMeshData.blockLight.push(0, 0, 0, 0);
            }

            const skyLightIndexOffset = chunkPosition.y * CHUNK_WIDTH * CHUNK_WIDTH * CHUNK_WIDTH;
            const skyLightIndex = lightMapIndex + skyLightIndexOffset;
            if (skyLightIndex >= 0 && skyLightIndex < blockData.skyLight.length) {
                const skyLight = blockData.skyLight[skyLightIndex];
                partialChunkMeshData.skyLight.push(skyLight, skyLight, skyLight, skyLight);
            } else {
                partialChunkMeshData.skyLight.push(0, 0, 0, 0);
            }
        }

        /**
         * Foliage
         */
        const block = Blocks.getBlockById(blockId);
        for (let i = 0; i < modelMesh.vertices.length; i += 3) {
            partialChunkMeshData.foliage.push(block.isFoliage ? 1 : 0);
        }
    }

    private isFaceVisible(blockData: ChunkBlockData, position: Vector3, face: BlockFace, isVisible: IsVisible): boolean {
        const neighbor = getBlockFromChunkBlockData(blockData, position.clone().add(BLOCK_FACE_NORMAL[face]));

        // TODO: Take into account which block is currently rendered to determine if the face is visible. Otherwise
        // transparent blocks wouldn't render adjacent faces despite them being different block types.
        return !isVisible(neighbor) || Blocks.getBlockById(neighbor).occludesNeighborBlocks === false;
    }
}

export function getBlockFromChunkBlockData({ blocks, neighborBlocks }: ChunkBlockData, pos: BlockPos): number {
    const blockIndex = posToIndex(modifyBlockPosValues(pos, (v) => mod(v, CHUNK_WIDTH)));
    if (isBlockPosIn(pos, { x: 0, y: 0, z: 0 }, { x: CHUNK_WIDTH - 1, y: CHUNK_WIDTH - 1, z: CHUNK_WIDTH - 1 })) {
        return blocks[blockIndex];
    }

    const neighborPos = modifyBlockPosValues(pos, (v) => Math.floor((v + CHUNK_WIDTH) / CHUNK_WIDTH));
    const neighborIndex = posToIndex(neighborPos, 3);
    if (neighborBlocks[neighborIndex] === undefined || neighborBlocks[neighborIndex].length === 0) {
        return 0; // No block data available? Guess that air would make most sense.
    }

    return neighborBlocks[neighborIndex][blockIndex];
}
