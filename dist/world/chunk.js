var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { Mesh, Vector3 } from "three";
import { Game } from "../game";
import { xyzTupelToIndex, xzyToIndex } from "../util/index-to-vector3";
import { Blocks } from "../block/blocks";
export var CHUNK_WIDTH = 16;
export var CHUNK_HEIGHT = 16;
var Chunk = /** @class */ (function () {
    function Chunk(chunkColumn, position) {
        this.chunkColumn = chunkColumn;
        this.position = position;
        this.isBlockDataDirty = false;
        this.shouldRebuild = false;
        this.blockData = new Uint8Array(CHUNK_WIDTH * CHUNK_WIDTH * CHUNK_HEIGHT);
        this.blockStates = new Map();
        this.timeSinceFirstRender = -1;
        var _a = Game.main.blocks.getBlockMaterials(), solid = _a.solid, transparent = _a.transparent, water = _a.water;
        this.solidMesh = new Mesh(undefined, solid);
        this.transparentMesh = new Mesh(undefined, transparent);
        this.waterMesh = new Mesh(undefined, water);
    }
    Chunk.prototype.register = function (scene) {
        var worldPosition = this.position.clone().multiply(new Vector3(CHUNK_WIDTH, CHUNK_HEIGHT, CHUNK_WIDTH));
        this.solidMesh.position.set(worldPosition.x, worldPosition.y, worldPosition.z);
        this.waterMesh.position.set(worldPosition.x, worldPosition.y, worldPosition.z);
        this.transparentMesh.position.set(worldPosition.x, worldPosition.y, worldPosition.z);
        scene.add(this.solidMesh);
        scene.add(this.waterMesh);
        scene.add(this.transparentMesh);
    };
    Chunk.prototype.unregister = function (scene) {
        scene.remove(this.solidMesh);
        scene.remove(this.waterMesh);
        scene.remove(this.transparentMesh);
    };
    Chunk.prototype.onTick = function (deltaTime) { };
    Chunk.prototype.tickBlocks = function () {
        for (var i = 0; i < 10; i++) {
            this.tickRandomBlock();
        }
    };
    Chunk.prototype.tickRandomBlock = function () {
        var blockPos = new Vector3(Math.floor(Math.random() * CHUNK_WIDTH), Math.floor(Math.random() * CHUNK_WIDTH), Math.floor(Math.random() * CHUNK_WIDTH));
        var blockId = this.blockData[xzyToIndex(blockPos, CHUNK_WIDTH, CHUNK_WIDTH)];
        var block = Blocks.getBlockById(blockId);
        if (!block) {
            return;
        }
        block.onRandomTick(Game.main.level, {
            x: blockPos.x + this.position.x * CHUNK_WIDTH,
            y: blockPos.y + this.position.y * CHUNK_HEIGHT,
            z: blockPos.z + this.position.z * CHUNK_WIDTH,
        });
    };
    Chunk.prototype.lateUpdate = function (deltaTime) {
        if (this.isBlockDataDirty || this.shouldRebuild) {
            this.isBlockDataDirty = false;
            this.shouldRebuild = false;
            this.buildMesh();
        }
        if (this.timeSinceFirstRender >= 0 && !Array.isArray(this.solidMesh.material) && this.solidMesh.material.transparent) {
            this.timeSinceFirstRender += deltaTime;
            this.solidMesh.material.opacity = this.timeSinceFirstRender / 1000;
            this.solidMesh.material.transparent = this.timeSinceFirstRender < 1000;
        }
    };
    Chunk.prototype.generateTerrain = function (skipMeshBuild) {
        if (skipMeshBuild === void 0) { skipMeshBuild = false; }
        return __awaiter(this, void 0, void 0, function () {
            var heightMap, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        heightMap = this.chunkColumn.heightMap;
                        if (!heightMap) {
                            return [2 /*return*/];
                        }
                        _a = this;
                        return [4 /*yield*/, Game.main.chunkGeneratorPool.buildBaseTerrain(this.position, heightMap)];
                    case 1:
                        _a.blockData = _b.sent();
                        this.isBlockDataDirty = !skipMeshBuild;
                        return [2 /*return*/];
                }
            });
        });
    };
    Chunk.prototype.buildMesh = function () {
        return __awaiter(this, void 0, void 0, function () {
            var blockModelIndices, geometry;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        blockModelIndices = {};
                        this.blockStates.forEach(function (state, index) {
                            var block = Blocks.getBlockById(_this.blockData[index]);
                            blockModelIndices[index] = block.getBlockModel(state);
                        });
                        return [4 /*yield*/, Game.main.chunkGeometryBuilderPool.buildGeometry({
                                blockModelIndices: blockModelIndices,
                                blocks: this.blockData,
                                neighborBlocks: this.getNeighborChunks().map(function (chunk) { var _a; return (_a = chunk === null || chunk === void 0 ? void 0 : chunk.blockData) !== null && _a !== void 0 ? _a : new Uint8Array(); }),
                            })];
                    case 1:
                        geometry = _a.sent();
                        this.solidMesh.geometry = geometry.solid;
                        this.waterMesh.geometry = geometry.water;
                        this.transparentMesh.geometry = geometry.transparent;
                        if (this.timeSinceFirstRender < 0) {
                            this.timeSinceFirstRender = 0;
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Chunk.prototype.getNeighborChunks = function () {
        return [
            this.chunkColumn.getChunk([this.position.x, this.position.y + 1, this.position.z]),
            this.chunkColumn.getChunk([this.position.x, this.position.y - 1, this.position.z]),
            this.chunkColumn.getChunk([this.position.x - 1, this.position.y, this.position.z]),
            this.chunkColumn.getChunk([this.position.x + 1, this.position.y, this.position.z]),
            this.chunkColumn.getChunk([this.position.x, this.position.y, this.position.z - 1]),
            this.chunkColumn.getChunk([this.position.x, this.position.y, this.position.z + 1]),
        ];
    };
    Chunk.prototype.setBlock = function (_a, block) {
        var x = _a[0], y = _a[1], z = _a[2];
        this.blockData[xyzTupelToIndex(x, y, z, CHUNK_WIDTH, CHUNK_WIDTH)] = Blocks.getBlockId(block);
        this.isBlockDataDirty = true;
        // TODO: Only update the relevant chunk
        if (x <= 0 || y <= 0 || z <= 0 || x >= CHUNK_WIDTH - 1 || y >= CHUNK_HEIGHT - 1 || z >= CHUNK_WIDTH - 1) {
            this.getNeighborChunks().forEach(function (chunk) { return chunk ? chunk.shouldRebuild = true : null; });
        }
    };
    Chunk.prototype.getBlock = function (_a) {
        var x = _a[0], y = _a[1], z = _a[2];
        if (!this.blockData) {
            return undefined;
        }
        var index = xyzTupelToIndex(x, y, z, CHUNK_WIDTH, CHUNK_WIDTH);
        if (index < 0 || index >= this.blockData.length) {
            return undefined;
        }
        return Blocks.getBlockById(this.blockData[index]);
    };
    Chunk.prototype.setBlockState = function (_a, state) {
        var x = _a[0], y = _a[1], z = _a[2];
        this.blockStates.set(xyzTupelToIndex(x, y, z, CHUNK_WIDTH, CHUNK_WIDTH), state);
        this.shouldRebuild = true;
    };
    Chunk.prototype.getBlockState = function (_a) {
        var x = _a[0], y = _a[1], z = _a[2];
        return this.blockStates.get(xyzTupelToIndex(x, y, z, CHUNK_WIDTH, CHUNK_WIDTH));
    };
    return Chunk;
}());
export { Chunk };
