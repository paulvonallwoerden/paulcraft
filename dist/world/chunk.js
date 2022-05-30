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
import { Mesh, Vector3 } from 'three';
import { Game } from '../game';
import { indexToPos, xyzTupelToIndex, xzyToIndex } from '../util/index-to-vector3';
import { Blocks } from '../block/blocks';
import { sumBlockPos } from '../block/block-pos';
import { manhattenDistance } from '../light/flood-fill';
import { areBlockLightPropertiesEqual } from '../light/are-block-light-properties-equal';
export var CHUNK_WIDTH = 16;
export var CHUNK_HEIGHT = 16;
var Chunk = /** @class */ (function () {
    function Chunk(chunkColumn, position) {
        this.chunkColumn = chunkColumn;
        this.position = position;
        this.shouldRebuild = false;
        this.rebuildsEnabled = false;
        this.blockData = new Uint8Array(CHUNK_WIDTH * CHUNK_WIDTH * CHUNK_HEIGHT);
        this.blockStates = new Map();
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
        var _a, _b, _c;
        if ((_a = this.solidMesh) === null || _a === void 0 ? void 0 : _a.geometry)
            this.solidMesh.geometry.dispose();
        if ((_b = this.waterMesh) === null || _b === void 0 ? void 0 : _b.geometry)
            this.waterMesh.geometry.dispose();
        if ((_c = this.transparentMesh) === null || _c === void 0 ? void 0 : _c.geometry)
            this.transparentMesh.geometry.dispose();
        scene.remove(this.solidMesh);
        scene.remove(this.waterMesh);
        scene.remove(this.transparentMesh);
    };
    Chunk.prototype.onTick = function (deltaTime) { };
    /**
     * Some blocks are chosen at random and ticked.
     *
     * Reference: https://minecraft.fandom.com/wiki/Tick#Random_tick
     */
    Chunk.prototype.tickBlocks = function () {
        for (var i = 0; i < 3; i++) {
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
        if (this.shouldRebuild) {
            this.shouldRebuild = false;
            this.buildMesh();
        }
    };
    Chunk.prototype.generateTerrain = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, Game.main.chunkGeneratorPool.buildBaseTerrain(this.position)];
                    case 1:
                        _a.blockData = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Chunk.prototype.decorateTerrain = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.applySpilledBlockData();
                return [2 /*return*/];
            });
        });
    };
    Chunk.prototype.applySpilledBlockData = function () {
        var spilledBlockData = this.chunkColumn.getSpilledBlockData();
        if (!spilledBlockData) {
            return;
        }
        for (var x = 0; x < CHUNK_WIDTH; x++) {
            for (var y = 0; y < CHUNK_HEIGHT; y++) {
                for (var z = 0; z < CHUNK_WIDTH; z++) {
                    var index = xyzTupelToIndex(x, y + this.position.y * CHUNK_HEIGHT, z, CHUNK_WIDTH, CHUNK_WIDTH);
                    var spilledBlock = spilledBlockData[index];
                    if (!spilledBlock) {
                        continue;
                    }
                    var blockDataIndex = xyzTupelToIndex(x, y, z, CHUNK_WIDTH, CHUNK_WIDTH);
                    this.blockData[blockDataIndex] = spilledBlock;
                }
            }
        }
    };
    Chunk.prototype.requestRebuild = function () {
        if (!this.rebuildsEnabled) {
            return;
        }
        this.shouldRebuild = true;
    };
    Chunk.prototype.buildMesh = function () {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var blockModelIndices, geometry;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        blockModelIndices = {};
                        this.blockStates.forEach(function (state, index) {
                            var block = Blocks.getBlockById(_this.blockData[index]);
                            blockModelIndices[index] = block.getBlockModel(state);
                        });
                        if ((_a = this.solidMesh) === null || _a === void 0 ? void 0 : _a.geometry)
                            this.solidMesh.geometry.dispose();
                        if ((_b = this.waterMesh) === null || _b === void 0 ? void 0 : _b.geometry)
                            this.waterMesh.geometry.dispose();
                        if ((_c = this.transparentMesh) === null || _c === void 0 ? void 0 : _c.geometry)
                            this.transparentMesh.geometry.dispose();
                        return [4 /*yield*/, Game.main.chunkGeometryBuilderPool.buildGeometry(this.position, {
                                blockModelIndices: blockModelIndices,
                                blocks: this.blockData,
                                neighborBlocks: this.getNeighborChunkBlocks(),
                                skyLight: this.chunkColumn.getSkyLight(),
                            })];
                    case 1:
                        geometry = _d.sent();
                        this.solidMesh.geometry = geometry.solid;
                        this.waterMesh.geometry = geometry.water;
                        this.transparentMesh.geometry = geometry.transparent;
                        return [2 /*return*/];
                }
            });
        });
    };
    Chunk.prototype.getNeighborChunkBlocks = function () {
        var _a;
        var neighborBlockData = [];
        for (var i = 0; i < 3 * 3 * 3; i++) {
            var pos = sumBlockPos(indexToPos(i, 3), { x: this.position.x - 1, y: this.position.y - 1, z: this.position.z - 1 });
            var chunk = this.chunkColumn.getChunk([pos.x, pos.y, pos.z]);
            neighborBlockData.push((_a = chunk === null || chunk === void 0 ? void 0 : chunk.getBlockData()) !== null && _a !== void 0 ? _a : new Uint8Array());
        }
        return neighborBlockData;
    };
    Chunk.prototype.getNeighborChunks = function (maxDistance) {
        if (maxDistance === void 0) { maxDistance = 3; }
        var neighborChunks = [];
        for (var i = 0; i < 3 * 3 * 3; i++) {
            var relativePos = indexToPos(i, 3);
            var distance = manhattenDistance(relativePos, { x: 1, y: 1, z: 1 });
            if (distance > maxDistance || distance === 0) {
                continue;
            }
            var pos = sumBlockPos(relativePos, { x: this.position.x - 1, y: this.position.y - 1, z: this.position.z - 1 });
            var chunk = this.chunkColumn.getChunk([pos.x, pos.y, pos.z]);
            if (!chunk) {
                continue;
            }
            neighborChunks.push(chunk);
        }
        return neighborChunks;
    };
    Chunk.prototype.setBlock = function (_a, block) {
        var x = _a[0], y = _a[1], z = _a[2];
        var oldBlockId = this.blockData[xyzTupelToIndex(x, y, z, CHUNK_WIDTH, CHUNK_WIDTH)];
        var newBlockId = Blocks.getBlockId(block);
        if (newBlockId === oldBlockId) {
            return;
        }
        this.blockData[xyzTupelToIndex(x, y, z, CHUNK_WIDTH, CHUNK_WIDTH)] = newBlockId;
        this.requestRebuild();
        // TODO: Only update the relevant chunk
        var oldBlock = Blocks.getBlockById(oldBlockId);
        if (!areBlockLightPropertiesEqual(block, oldBlock)) {
            this.getNeighborChunks().forEach(function (chunk) { return chunk.requestRebuild(); });
        }
        else if (x <= 0 || y <= 0 || z <= 0 || x >= CHUNK_WIDTH - 1 || y >= CHUNK_HEIGHT - 1 || z >= CHUNK_WIDTH - 1) {
            console.log("pls update for ".concat(oldBlock.name, " -> ").concat(block.name));
            this.getNeighborChunks(1).forEach(function (chunk) { return chunk.requestRebuild(); });
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
        this.requestRebuild();
    };
    Chunk.prototype.getBlockState = function (_a) {
        var x = _a[0], y = _a[1], z = _a[2];
        return this.blockStates.get(xyzTupelToIndex(x, y, z, CHUNK_WIDTH, CHUNK_WIDTH));
    };
    Chunk.prototype.setBlockData = function (blockData) {
        this.blockData = blockData;
    };
    Chunk.prototype.getBlockData = function () {
        return this.blockData;
    };
    Chunk.prototype.enableRebuilds = function () {
        this.rebuildsEnabled = true;
    };
    return Chunk;
}());
export { Chunk };
