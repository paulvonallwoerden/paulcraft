var _a;
import { Vector3 } from "three";
import { BlockFace } from "../block/block-face";
import { BlockModelRenderer } from "../block/block-model/block-model-renderer";
import { indexToXZY, xzyToIndex } from "../util/index-to-vector3";
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
    ChunkRenderer.prototype.buildGeometry = function (blockData) {
        // TODO: Don't hard-code visibility of blocks but define it in the block model.
        // TODO: Can the solid & transparent meshes be merged into one mesh?
        // TODO: Is there a need for block models being included in two meshes? E.g. solid cauldron with water?
        return {
            solid: this.buildGeometryWithOptions(blockData, function (blockId) { return [1, 2, 3, 4, 5].includes(blockId); }),
            water: this.buildGeometryWithOptions(
            // There currently is no water.
            blockData, function (blockId) { return blockId === 7; }),
            transparent: this.buildGeometryWithOptions(
            // There currently are no transparent blocks.
            blockData, function (blockId) { return [6, 8].includes(blockId); }),
        };
    };
    ChunkRenderer.prototype.buildGeometryWithOptions = function (blockData, isVisible) {
        var partialChunkMeshData = {
            normals: [],
            triangles: [],
            uv: [],
            vertices: [],
        };
        for (var i = 0; i < blockData.blocks.length; i += 1) {
            var pos = indexToXZY(i, CHUNK_WIDTH, CHUNK_WIDTH);
            if (!isVisible(blockData.blocks[i])) {
                continue;
            }
            this.renderBlock(blockData, pos, partialChunkMeshData, isVisible);
        }
        return {
            vertices: new Float32Array(partialChunkMeshData.vertices),
            triangles: partialChunkMeshData.triangles,
            normals: new Float32Array(partialChunkMeshData.normals),
            uv: new Float32Array(partialChunkMeshData.uv),
        };
    };
    ChunkRenderer.prototype.renderBlock = function (blockData, position, partialChunkMeshData, isVisible) {
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
    };
    ChunkRenderer.prototype.isFaceVisible = function (blockData, position, face, isVisible) {
        var neighbor = this.getBlock(blockData, position.clone().add(BLOCK_FACE_NORMAL[face]));
        // TODO: Take into account which block is currently rendered to determine if the face is visible. Otherwise
        // transparent blocks wouldn't render adjacent faces despite them being different block types.
        return !isVisible(neighbor);
    };
    ChunkRenderer.prototype.getBlock = function (_a, position) {
        var blocks = _a.blocks, neighborBlocks = _a.neighborBlocks;
        // Above
        if (position.y >= CHUNK_HEIGHT) {
            return neighborBlocks[0][xzyToIndex(new Vector3(position.x, mod(position.y, CHUNK_HEIGHT), position.z), CHUNK_WIDTH, CHUNK_WIDTH)];
        }
        // Below
        if (position.y < 0) {
            return neighborBlocks[1][xzyToIndex(new Vector3(position.x, mod(position.y, CHUNK_HEIGHT), position.z), CHUNK_WIDTH, CHUNK_WIDTH)];
        }
        // Left
        if (position.x < 0) {
            return neighborBlocks[2][xzyToIndex(new Vector3(mod(position.x, CHUNK_WIDTH), position.y, position.z), CHUNK_WIDTH, CHUNK_WIDTH)];
        }
        // Right
        if (position.x >= CHUNK_WIDTH) {
            return neighborBlocks[3][xzyToIndex(new Vector3(mod(position.x, CHUNK_WIDTH), position.y, position.z), CHUNK_WIDTH, CHUNK_WIDTH)];
        }
        // Back
        if (position.z < 0) {
            return neighborBlocks[4][xzyToIndex(new Vector3(position.x, position.y, mod(position.z, CHUNK_WIDTH)), CHUNK_WIDTH, CHUNK_WIDTH)];
        }
        // Front
        if (position.z >= CHUNK_WIDTH) {
            return neighborBlocks[5][xzyToIndex(new Vector3(position.x, position.y, mod(position.z, CHUNK_WIDTH)), CHUNK_WIDTH, CHUNK_WIDTH)];
        }
        // Within
        return blocks[xzyToIndex(position, CHUNK_WIDTH, CHUNK_WIDTH)];
    };
    return ChunkRenderer;
}());
export { ChunkRenderer };
