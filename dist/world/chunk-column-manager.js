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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { ChunkColumn, ChunkColumnPriority } from "./chunk-column";
import pAll from 'p-all';
var ChunkColumnManager = /** @class */ (function () {
    function ChunkColumnManager(scene, renderDistance, simulationDistance, chunkUpdateConcurrency) {
        this.scene = scene;
        this.renderDistance = renderDistance;
        this.simulationDistance = simulationDistance;
        this.chunkUpdateConcurrency = chunkUpdateConcurrency;
        this.chunkColumns = {};
        this.chunkColumnPositions = [];
        this.requestedUpdateChunkColumns = [];
        this.numberOfCurrentlyRunningRequestedChunkUpdates = 0;
    }
    ChunkColumnManager.prototype.setCenter = function (centerX, centerZ) {
        var _this = this;
        var candidateRange = Math.max(this.renderDistance, this.simulationDistance) + 2;
        var candidates = [];
        for (var x = -candidateRange; x <= candidateRange; x += 1) {
            for (var z = -candidateRange; z <= candidateRange; z += 1) {
                candidates.push({
                    x: x + centerX,
                    z: z + centerZ,
                    priority: this.calculateChunkColumnPriority(x, z),
                });
            }
        }
        // Load new columns
        pAll(candidates.map(function (candidate) { return function () { return __awaiter(_this, void 0, void 0, function () {
            var chunkColumn;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        chunkColumn = this.getChunkColumn(candidate.x, candidate.z);
                        if (!!chunkColumn) return [3 /*break*/, 2];
                        chunkColumn = new ChunkColumn(this, [candidate.x, candidate.z], 8);
                        chunkColumn.register(this.scene);
                        this.setChunkColumn(candidate.x, candidate.z, chunkColumn);
                        return [4 /*yield*/, chunkColumn.generatePrototype()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, chunkColumn.setPriority(candidate.priority)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }; }), { concurrency: this.chunkUpdateConcurrency });
        // Unload old columns
        for (var _i = 0, _a = this.chunkColumnPositions; _i < _a.length; _i++) {
            var _b = _a[_i], x = _b[0], z = _b[1];
            var remove = Math.abs(x - centerX) > this.renderDistance + 1 || Math.abs(z - centerZ) > this.renderDistance + 1;
            var chunkColumn = this.getChunkColumn(x, z);
            if (remove && chunkColumn) {
                chunkColumn.unregister(this.scene);
                this.setChunkColumn(x, z, undefined);
            }
        }
    };
    ChunkColumnManager.prototype.update = function (deltaTime) {
        this.handleRequestedChunkUpdates();
    };
    ChunkColumnManager.prototype.handleRequestedChunkUpdates = function () {
        return __awaiter(this, void 0, void 0, function () {
            var chunkColumnToUpdate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.numberOfCurrentlyRunningRequestedChunkUpdates > 100) {
                            return [2 /*return*/];
                        }
                        chunkColumnToUpdate = this.requestedUpdateChunkColumns.pop();
                        if (!chunkColumnToUpdate) {
                            return [2 /*return*/];
                        }
                        this.numberOfCurrentlyRunningRequestedChunkUpdates += 1;
                        return [4 /*yield*/, chunkColumnToUpdate.requestedUpdate()];
                    case 1:
                        _a.sent();
                        this.numberOfCurrentlyRunningRequestedChunkUpdates -= 1;
                        return [2 /*return*/];
                }
            });
        });
    };
    ChunkColumnManager.prototype.lateUpdate = function (deltaTime) {
        var _this = this;
        this.chunkColumnPositions.forEach(function (_a) {
            var x = _a[0], z = _a[1];
            var chunkColumn = _this.getChunkColumn(x, z);
            if (chunkColumn) {
                chunkColumn.lateUpdate(deltaTime);
            }
        });
    };
    ChunkColumnManager.prototype.tick = function (deltaTime) {
        var _this = this;
        this.chunkColumnPositions.forEach(function (_a) {
            var x = _a[0], z = _a[1];
            var chunkColumn = _this.getChunkColumn(x, z);
            if (chunkColumn) {
                chunkColumn.onTick(deltaTime);
            }
        });
    };
    ChunkColumnManager.prototype.getChunkByBlockPos = function (pos) {
        var x = Math.floor(pos.x / 16);
        var z = Math.floor(pos.z / 16);
        var column = this.getChunkColumn(x, z);
        if (!column) {
            return undefined;
        }
        var y = Math.floor(pos.y / 16);
        return column.chunks[y];
    };
    ChunkColumnManager.prototype.__tempGetChunkMeshes = function () {
        var _this = this;
        return this.chunkColumnPositions.flatMap(function (cp) { var _a, _b; return (_b = (_a = _this.chunkColumns[cp[0]][cp[1]]) === null || _a === void 0 ? void 0 : _a.getChunkMeshes()) !== null && _b !== void 0 ? _b : []; });
    };
    ChunkColumnManager.prototype.requestChunkUpdate = function (chunkColumnToAdd) {
        this.requestedUpdateChunkColumns = __spreadArray(__spreadArray([], this.requestedUpdateChunkColumns.filter(function (chunkColumn) { return chunkColumn != chunkColumnToAdd; }), true), [
            chunkColumnToAdd,
        ], false);
    };
    ChunkColumnManager.prototype.calculateChunkColumnPriority = function (x, z) {
        var absX = Math.abs(x);
        var absZ = Math.abs(z);
        if (absX < this.simulationDistance && absZ < this.simulationDistance) {
            return ChunkColumnPriority.High;
        }
        if (absX < this.renderDistance && absZ < this.renderDistance) {
            return ChunkColumnPriority.Middle;
        }
        if (absX < this.renderDistance + 1 && absZ < this.renderDistance + 1) {
            return ChunkColumnPriority.Low;
        }
        return ChunkColumnPriority.Lowest;
    };
    ChunkColumnManager.prototype.setChunkColumn = function (x, z, chunkColumn) {
        if (!this.chunkColumns[x]) {
            this.chunkColumns[x] = {};
        }
        if (chunkColumn !== undefined) {
            this.chunkColumnPositions.push([x, z]);
        }
        else {
            this.chunkColumnPositions = this.chunkColumnPositions.filter(function (_a) {
                var pX = _a[0], pZ = _a[1];
                return pX !== x || pZ !== z;
            });
        }
        this.chunkColumns[x][z] = chunkColumn;
    };
    ChunkColumnManager.prototype.getChunkColumn = function (x, z) {
        if (!this.chunkColumns[x]) {
            return;
        }
        return this.chunkColumns[x][z];
    };
    return ChunkColumnManager;
}());
export { ChunkColumnManager };
