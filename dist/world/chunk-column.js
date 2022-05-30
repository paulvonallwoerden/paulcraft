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
import { Vector3 } from 'three';
import { Chunk, CHUNK_HEIGHT } from './chunk';
import { Game } from '../game';
import { CHUNK_WIDTH } from './chunk/chunk-constants';
import { posToIndex } from '../util/index-to-vector3';
import { mod } from '../util/mod';
var ChunkColumn = /** @class */ (function () {
    function ChunkColumn(manager, position, height) {
        this.manager = manager;
        this.position = position;
        this.chunks = [];
        this.skyLight = new Uint8Array(CHUNK_WIDTH * CHUNK_WIDTH * CHUNK_WIDTH * 8);
        for (var i = 0; i < height; i++) {
            this.chunks.push(new Chunk(this, new Vector3(position[0], i, position[1])));
        }
    }
    ChunkColumn.prototype.register = function (scene) {
        this.chunks.forEach(function (chunk) { return chunk.register(scene); });
    };
    ChunkColumn.prototype.unregister = function (scene) {
        this.chunks.forEach(function (chunk) { return chunk.unregister(scene); });
    };
    ChunkColumn.prototype.generatePrototype = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); });
    };
    ChunkColumn.prototype.onTick = function (deltaTime) {
        this.chunks.forEach(function (chunk) {
            chunk.onTick(deltaTime);
            chunk.tickBlocks();
        });
    };
    ChunkColumn.prototype.lateUpdate = function (deltaTime) {
        this.chunks.forEach(function (chunk) { return chunk.lateUpdate(deltaTime); });
    };
    ChunkColumn.prototype.setBlockAt = function (_a, block) {
        var x = _a[0], y = _a[1], z = _a[2];
        var chunkLocalY = Math.floor(y / CHUNK_HEIGHT);
        if (chunkLocalY < 0 || chunkLocalY >= this.chunks.length) {
            return;
        }
        var oldBlock = this.getBlockAt([x, y, z]);
        this.chunks[chunkLocalY].setBlock([x, y - chunkLocalY * CHUNK_HEIGHT, z], block);
        // TODO: Run this async and NOT sync! Important!
        if (oldBlock !== block && ((oldBlock === null || oldBlock === void 0 ? void 0 : oldBlock.blocksLight) !== block.blocksLight)) {
            this.calculateSkyLight();
        }
    };
    ChunkColumn.prototype.getBlockAt = function (_a) {
        var x = _a[0], y = _a[1], z = _a[2];
        var chunkLocalY = Math.floor(y / CHUNK_HEIGHT);
        if (!this.chunks[chunkLocalY]) {
            return undefined;
        }
        return this.chunks[chunkLocalY].getBlock([x, y - chunkLocalY * CHUNK_HEIGHT, z]);
    };
    ChunkColumn.prototype.decorateTerrain = function () {
        return __awaiter(this, void 0, void 0, function () {
            var decoratedBlocks;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Game.main.chunkGeneratorPool.decorateTerrain(this.position, this.chunks.map(function (chunk) { return chunk.getBlockData(); }))];
                    case 1:
                        decoratedBlocks = _a.sent();
                        this.chunks.forEach(function (chunk, i) { return chunk.setBlockData(decoratedBlocks[i]); });
                        this.calculateSkyLight();
                        return [2 /*return*/];
                }
            });
        });
    };
    ChunkColumn.prototype.getChunkMeshes = function () {
        return this.chunks.flatMap(function (chunk) { return [chunk.solidMesh, chunk.transparentMesh]; }).filter(function (chunk) { return chunk !== undefined; });
    };
    ChunkColumn.prototype.getChunk = function (absolutePos) {
        if (this.position[0] === absolutePos[0] && this.position[1] === absolutePos[2]) {
            return this.chunks[absolutePos[1]];
        }
        var neighborColumn = this.manager.getChunkColumn(absolutePos[0], absolutePos[2]);
        if (!neighborColumn) {
            return undefined;
        }
        return neighborColumn.chunks[absolutePos[1]];
    };
    ChunkColumn.prototype.spillBlockData = function (blockData) {
        this.spilledBlockData = blockData;
    };
    ChunkColumn.prototype.getSpilledBlockData = function () {
        return this.spilledBlockData;
    };
    ChunkColumn.prototype.calculateSkyLight = function () {
        this.skyLight = new Uint8Array(this.skyLight.length);
        for (var x = 0; x < CHUNK_WIDTH; x += 1) {
            for (var z = 0; z < CHUNK_WIDTH; z += 1) {
                for (var y = CHUNK_WIDTH * 8 - 1; y >= 0; y -= 1) {
                    var pos = { x: x, y: y, z: z };
                    if (this.getBlockAt([mod(x, 16), y, mod(z, 16)]).blocksLight) {
                        break;
                    }
                    this.skyLight[posToIndex(pos)] = 15;
                }
            }
        }
    };
    ChunkColumn.prototype.getSkyLight = function () {
        return this.skyLight;
    };
    return ChunkColumn;
}());
export { ChunkColumn };
