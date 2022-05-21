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
import { Vector3 } from "three";
import { Game } from "../game";
import { Chunk, CHUNK_HEIGHT } from "./chunk";
import pEachSeries from "p-each-series";
export var ChunkColumnPriority;
(function (ChunkColumnPriority) {
    // Render & Tick
    ChunkColumnPriority[ChunkColumnPriority["High"] = 3] = "High";
    // Render
    ChunkColumnPriority[ChunkColumnPriority["Middle"] = 2] = "Middle";
    // Generate
    ChunkColumnPriority[ChunkColumnPriority["Low"] = 1] = "Low";
    // Prepare
    ChunkColumnPriority[ChunkColumnPriority["Lowest"] = 0] = "Lowest";
})(ChunkColumnPriority || (ChunkColumnPriority = {}));
var ChunkColumn = /** @class */ (function () {
    function ChunkColumn(manager, position, height) {
        this.manager = manager;
        this.position = position;
        this.chunks = [];
        this.chunksBuilt = false;
        this.chunksGenerated = false;
        this.priority = ChunkColumnPriority.Lowest;
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
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.heightMap) {
                            return [2 /*return*/];
                        }
                        _a = this;
                        return [4 /*yield*/, Game.main.chunkGeneratorPool.generateHeightMap(this.position)];
                    case 1:
                        _a.heightMap = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ChunkColumn.prototype.setPriority = function (priority) {
        return __awaiter(this, void 0, void 0, function () {
            var oldPriority;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.priority === priority) {
                            return [2 /*return*/];
                        }
                        oldPriority = this.priority;
                        this.priority = priority;
                        if (!(priority >= ChunkColumnPriority.Low && priority > oldPriority)) return [3 /*break*/, 3];
                        if (!!this.chunksGenerated) return [3 /*break*/, 2];
                        return [4 /*yield*/, pEachSeries(this.chunks, function (chunk) { return chunk.generateTerrain(true); })];
                    case 1:
                        _a.sent();
                        this.chunksGenerated = true;
                        _a.label = 2;
                    case 2:
                        this.manager.requestChunkUpdate(this);
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ChunkColumn.prototype.requestedUpdate = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.chunksGenerated
                            && !this.chunksBuilt
                            && this.areNeighborsGenerated())) return [3 /*break*/, 2];
                        return [4 /*yield*/, Promise.all(this.chunks.map(function (chunk) { return chunk.buildMesh(); }))];
                    case 1:
                        _a.sent();
                        this.chunksBuilt = true;
                        this.requestNeighborColumnsToUpdate();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    ChunkColumn.prototype.areNeighborsGenerated = function () {
        var _this = this;
        return [[-1, 0], [1, 0], [0, -1], [0, 1]].reduce(function (result, pos) {
            var _a, _b;
            if (!result) {
                return false;
            }
            return (_b = (_a = _this.manager.getChunkColumn(_this.position[0] + pos[0], _this.position[1] + pos[1])) === null || _a === void 0 ? void 0 : _a.chunksGenerated) !== null && _b !== void 0 ? _b : false;
        }, true);
    };
    ChunkColumn.prototype.requestNeighborColumnsToUpdate = function () {
        var _this = this;
        [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(function (pos) {
            var neighbor = _this.manager.getChunkColumn(_this.position[0] + pos[0], _this.position[1] + pos[1]);
            if (!neighbor) {
                return;
            }
            _this.manager.requestChunkUpdate(neighbor);
        });
    };
    ChunkColumn.prototype.onTick = function (deltaTime) {
        var _this = this;
        this.chunks.forEach(function (chunk) {
            chunk.onTick(deltaTime);
            if (_this.priority === ChunkColumnPriority.High) {
                chunk.tickBlocks();
            }
        });
    };
    ChunkColumn.prototype.lateUpdate = function (deltaTime) {
        if (this.priority <= ChunkColumnPriority.Low) {
            return;
        }
        this.chunks.forEach(function (chunk) { return chunk.lateUpdate(deltaTime); });
    };
    ChunkColumn.prototype.setBlockAt = function (_a, block) {
        var x = _a[0], y = _a[1], z = _a[2];
        var chunkLocalY = Math.floor(y / CHUNK_HEIGHT);
        if (chunkLocalY < 0 || chunkLocalY >= this.chunks.length) {
            return;
        }
        return this.chunks[chunkLocalY].setBlock([x, y - chunkLocalY * CHUNK_HEIGHT, z], block);
    };
    ChunkColumn.prototype.getBlockAt = function (_a) {
        var x = _a[0], y = _a[1], z = _a[2];
        var chunkLocalY = Math.floor(y / CHUNK_HEIGHT);
        if (!this.chunks[chunkLocalY]) {
            return undefined;
        }
        return this.chunks[chunkLocalY].getBlock([x, y - chunkLocalY * CHUNK_HEIGHT, z]);
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
    return ChunkColumn;
}());
export { ChunkColumn };
