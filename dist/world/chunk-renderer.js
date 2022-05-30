var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var _a;
import { Vector3 } from "three";
import { BlockFace } from "../block/block-face";
import { BlockModelRenderer } from "../block/block-model/block-model-renderer";
import { isBlockPosIn, modifyBlockPosValues } from "../block/block-pos";
import { Blocks } from "../block/blocks";
import { floodFillBlockLightAdditive } from "../light/flood-fill";
import { indexToPos, indexToXZY, posToIndex, xzyToIndex } from "../util/index-to-vector3";
import { mod } from "../util/mod";
var CHUNK_HEIGHT = 16;
var CHUNK_WIDTH = 16;
var BLOCK_FACE_NORMAL = (_a = {},
    _a[BlockFace.TOP] = new Vector3(0, 1, 0),
    _a[BlockFace.BOTTOM] = new Vector3(0, -1, 0),
    _a[BlockFace.LEFT] = new Vector3(1, 0, 0),
    _a[BlockFace.RIGHT] = new Vector3(-1, 0, 0),
    _a[BlockFace.FRONT] = new Vector3(0, 0, 1),
    _a[BlockFace.BACK] = new Vector3(0, 0, -1),
    _a);
var ChunkRenderer = /** @class */ (function () {
    function ChunkRenderer(blockModels) {
        this.blockModels = blockModels;
    }
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
    ChunkRenderer.prototype.buildGeometry = function (chunkPosition, blockData) {
        // TODO: Don't hard-code visibility of blocks but define it in the block model.
        // TODO: Can the solid & transparent meshes be merged into one mesh?
        // TODO: Is there a need for block models being included in two meshes? E.g. solid cauldron with water?
        var blockLight = this.calculateBlockLight(blockData);
        var chunkBlockDataWithLight = __assign(__assign({}, blockData), { blockLight: blockLight });
        return {
            solid: this.buildGeometryWithOptions(chunkPosition, chunkBlockDataWithLight, function (blockId) { return [1, 2, 3, 4, 5, 10, 11].includes(blockId); }),
            water: this.buildGeometryWithOptions(chunkPosition, 
            // There currently is no water.
            chunkBlockDataWithLight, function (blockId) { return blockId === 7; }),
            transparent: this.buildGeometryWithOptions(chunkPosition, 
            // There currently are no transparent blocks.
            chunkBlockDataWithLight, function (blockId) { return [6, 8, 9].includes(blockId); }),
        };
    };
    ChunkRenderer.prototype.calculateBlockLight = function (blockData) {
        var blockLight = new Uint8Array(blockData.blocks.length);
        for (var i = 0; i < (16 * 3) * (16 * 3) * (16 * 3); i++) {
            var pos = modifyBlockPosValues(indexToPos(i, 16 * 3), function (v) { return v - 16; });
            var block = Blocks.getBlockById(getBlockFromChunkBlockData(blockData, pos));
            var lightLevel = block.getLightLevel();
            if (lightLevel <= 0) {
                continue;
            }
            floodFillBlockLightAdditive(blockLight, pos, lightLevel, function (pos) { return (Blocks.getBlockById(getBlockFromChunkBlockData(blockData, pos)).blocksLight); });
        }
        return blockLight;
    };
    ChunkRenderer.prototype.buildGeometryWithOptions = function (chunkPosition, blockData, isVisible) {
        var partialChunkMeshData = {
            vertices: [],
            normals: [],
            triangles: [],
            uv: [],
            skyLight: [],
            blockLight: [],
            foliage: [],
        };
        for (var i = 0; i < blockData.blocks.length; i += 1) {
            var pos = indexToXZY(i, CHUNK_WIDTH, CHUNK_WIDTH);
            if (!isVisible(blockData.blocks[i])) {
                continue;
            }
            this.renderBlock(chunkPosition, blockData, pos, partialChunkMeshData, isVisible);
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
    };
    ChunkRenderer.prototype.renderBlock = function (chunkPosition, blockData, position, partialChunkMeshData, isVisible) {
        var _a, _b, _c, _d;
        var _e;
        var blockDataBlocksIndex = xzyToIndex(position, CHUNK_WIDTH, CHUNK_WIDTH);
        var blockId = blockData.blocks[blockDataBlocksIndex];
        // TODO: Don't recreate the block model renderer for each block.
        var modelRenderer = new BlockModelRenderer(this.blockModels.textureUvs);
        var solidityMap = (_a = {},
            _a[BlockFace.TOP] = !this.isFaceVisible(blockData, position, BlockFace.TOP, isVisible),
            _a[BlockFace.BOTTOM] = !this.isFaceVisible(blockData, position, BlockFace.BOTTOM, isVisible),
            _a[BlockFace.LEFT] = !this.isFaceVisible(blockData, position, BlockFace.LEFT, isVisible),
            _a[BlockFace.RIGHT] = !this.isFaceVisible(blockData, position, BlockFace.RIGHT, isVisible),
            _a[BlockFace.FRONT] = !this.isFaceVisible(blockData, position, BlockFace.FRONT, isVisible),
            _a[BlockFace.BACK] = !this.isFaceVisible(blockData, position, BlockFace.BACK, isVisible),
            _a);
        // TODO: Only render block models once and translate the vertices to the correct position.
        var modelIndex = (_e = blockData.blockModelIndices[blockDataBlocksIndex]) !== null && _e !== void 0 ? _e : 0;
        var modelMesh = modelRenderer.render(position, this.blockModels.blockModels[blockId][modelIndex], solidityMap);
        (_b = partialChunkMeshData.normals).push.apply(_b, modelMesh.normals);
        (_c = partialChunkMeshData.uv).push.apply(_c, modelMesh.uv);
        // This is probably not the nicest way to do this, but it works for now. Its purpose is to preserve
        // the correct triangle numbering for small meshes being merged into a big one while the small meshes
        // base the triangle index on 0.
        var numberOfVertices = (partialChunkMeshData.vertices.length / 3);
        for (var i = 0; i < modelMesh.triangles.length / 6; i++) {
            for (var j = 0; j < 6; j++) {
                partialChunkMeshData.triangles.push(modelMesh.triangles[i * 6 + j] + numberOfVertices);
            }
        }
        (_d = partialChunkMeshData.vertices).push.apply(_d, modelMesh.vertices);
        /**
         * Lighting
         */
        for (var i = 0; i < modelMesh.vertices.length; i += 3 * 4) {
            var faceNormal = new Vector3(modelMesh.normals[i], modelMesh.normals[i + 1], modelMesh.normals[i + 2]);
            var faceMidPoint = new Vector3(modelMesh.vertices[i + 0] + modelMesh.vertices[i + 3] + modelMesh.vertices[i + 6] + modelMesh.vertices[i + 9], modelMesh.vertices[i + 1] + modelMesh.vertices[i + 4] + modelMesh.vertices[i + 7] + modelMesh.vertices[i + 10], modelMesh.vertices[i + 2] + modelMesh.vertices[i + 5] + modelMesh.vertices[i + 8] + modelMesh.vertices[i + 11]).multiplyScalar(0.25);
            var samplePoint = faceMidPoint.add(faceNormal.multiplyScalar(0.5)).floor();
            var lightMapIndex = posToIndex(samplePoint);
            if (lightMapIndex >= 0 && lightMapIndex < blockData.blockLight.length) {
                var blockLight = blockData.blockLight[lightMapIndex];
                partialChunkMeshData.blockLight.push(blockLight, blockLight, blockLight, blockLight);
            }
            else {
                partialChunkMeshData.blockLight.push(0, 0, 0, 0);
            }
            var skyLightIndexOffset = chunkPosition.y * CHUNK_WIDTH * CHUNK_WIDTH * CHUNK_WIDTH;
            var skyLightIndex = lightMapIndex + skyLightIndexOffset;
            if (skyLightIndex >= 0 && skyLightIndex < blockData.skyLight.length) {
                var skyLight = blockData.skyLight[skyLightIndex];
                partialChunkMeshData.skyLight.push(skyLight, skyLight, skyLight, skyLight);
            }
            else {
                partialChunkMeshData.skyLight.push(0, 0, 0, 0);
            }
        }
        /**
         * Foliage
         */
        var block = Blocks.getBlockById(blockId);
        for (var i = 0; i < modelMesh.vertices.length; i += 3) {
            partialChunkMeshData.foliage.push(block.isFoliage ? 1 : 0);
        }
    };
    ChunkRenderer.prototype.isFaceVisible = function (blockData, position, face, isVisible) {
        var neighbor = getBlockFromChunkBlockData(blockData, position.clone().add(BLOCK_FACE_NORMAL[face]));
        // TODO: Take into account which block is currently rendered to determine if the face is visible. Otherwise
        // transparent blocks wouldn't render adjacent faces despite them being different block types.
        return !isVisible(neighbor) || Blocks.getBlockById(neighbor).occludesNeighborBlocks === false;
    };
    return ChunkRenderer;
}());
export { ChunkRenderer };
export function getBlockFromChunkBlockData(_a, pos) {
    var blocks = _a.blocks, neighborBlocks = _a.neighborBlocks;
    var blockIndex = posToIndex(modifyBlockPosValues(pos, function (v) { return mod(v, CHUNK_WIDTH); }));
    if (isBlockPosIn(pos, { x: 0, y: 0, z: 0 }, { x: CHUNK_WIDTH - 1, y: CHUNK_WIDTH - 1, z: CHUNK_WIDTH - 1 })) {
        return blocks[blockIndex];
    }
    var neighborPos = modifyBlockPosValues(pos, function (v) { return Math.floor((v + CHUNK_WIDTH) / CHUNK_WIDTH); });
    var neighborIndex = posToIndex(neighborPos, 3);
    if (neighborBlocks[neighborIndex] === undefined || neighborBlocks[neighborIndex].length === 0) {
        return 0; // No block data available? Guess that air would make most sense.
    }
    return neighborBlocks[neighborIndex][blockIndex];
}
