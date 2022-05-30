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
import { Vector2 } from 'three';
import { ChunkColumn } from './chunk-column';
var ChunkColumnState;
(function (ChunkColumnState) {
    ChunkColumnState[ChunkColumnState["Unregistered"] = -1] = "Unregistered";
    ChunkColumnState[ChunkColumnState["Registered"] = 0] = "Registered";
    ChunkColumnState[ChunkColumnState["Generating"] = 1] = "Generating";
    ChunkColumnState[ChunkColumnState["Generated"] = 2] = "Generated";
    ChunkColumnState[ChunkColumnState["Decorating"] = 3] = "Decorating";
    ChunkColumnState[ChunkColumnState["Decorated"] = 4] = "Decorated";
    ChunkColumnState[ChunkColumnState["Rendering"] = 5] = "Rendering";
    ChunkColumnState[ChunkColumnState["Rendered"] = 6] = "Rendered";
})(ChunkColumnState || (ChunkColumnState = {}));
var ChunkColumnManager = /** @class */ (function () {
    function ChunkColumnManager(scene, renderDistance, simulationDistance, chunkUpdateConcurrency) {
        this.scene = scene;
        this.renderDistance = renderDistance;
        this.simulationDistance = simulationDistance;
        this.chunkUpdateConcurrency = chunkUpdateConcurrency;
        this.loadedChunkColumns = [];
        this.chunkColumnStates = new Map();
    }
    ChunkColumnManager.prototype.setCenter = function (centerX, centerZ) {
        var _this = this;
        var range = Math.max(this.renderDistance, this.simulationDistance) + 2;
        for (var offsetX = -range; offsetX <= range; offsetX += 1) {
            for (var offsetZ = -range; offsetZ <= range; offsetZ += 1) {
                var x = centerX + offsetX;
                var z = centerZ + offsetZ;
                var targetState = this.calculateChunkColumnTargetState(offsetX, offsetZ);
                var maybeExistingColumn = this.getChunkColumn(x, z);
                if (maybeExistingColumn) {
                    var currentState = this.chunkColumnStates.get(maybeExistingColumn);
                    this.chunkColumnStates.set(maybeExistingColumn, {
                        is: currentState.is,
                        target: targetState,
                    });
                }
                else if (targetState !== ChunkColumnState.Unregistered) {
                    var newColumn = new ChunkColumn(this, [x, z], 8);
                    this.loadedChunkColumns.push(newColumn);
                    newColumn.register(this.scene);
                    this.chunkColumnStates.set(newColumn, {
                        is: ChunkColumnState.Registered,
                        target: targetState,
                    });
                }
            }
        }
        var center = new Vector2(centerX, centerZ);
        this.loadedChunkColumns.sort(function (a, b) {
            var aState = _this.chunkColumnStates.get(a);
            var bState = _this.chunkColumnStates.get(b);
            if (aState.target === ChunkColumnState.Unregistered && bState.target !== ChunkColumnState.Unregistered) {
                return Number.MIN_SAFE_INTEGER;
            }
            if (bState.target === ChunkColumnState.Unregistered && aState.target !== ChunkColumnState.Unregistered) {
                return Number.MAX_SAFE_INTEGER;
            }
            var aDist = new Vector2().fromArray(a.position).manhattanDistanceTo(center);
            var bDist = new Vector2().fromArray(b.position).manhattanDistanceTo(center);
            return aDist - bDist;
        });
    };
    ChunkColumnManager.prototype.update = function (deltaTime) {
        var _this = this;
        var _loop_1 = function (i) {
            var chunkColumn = this_1.loadedChunkColumns[i];
            var state = this_1.chunkColumnStates.get(chunkColumn);
            if (state.is === state.target) {
                return out_i_1 = i, "continue";
            }
            if (state.is > state.target && state.target === ChunkColumnState.Unregistered) {
                this_1.loadedChunkColumns.splice(i, 1);
                chunkColumn.unregister(this_1.scene);
                this_1.chunkColumnStates.delete(chunkColumn);
                i += 1;
                return out_i_1 = i, "continue";
            }
            else if (state.is > state.target) {
                return out_i_1 = i, "continue";
            }
            if (state.is === ChunkColumnState.Registered) {
                this_1.updateChunkColumnState(chunkColumn, { is: ChunkColumnState.Generating });
                Promise.all(chunkColumn.chunks.map(function (chunk) { return chunk.generateTerrain(); })).then(function () { return _this.updateChunkColumnState(chunkColumn, { is: ChunkColumnState.Generated }); });
                return { value: void 0 };
            }
            if (state.is === ChunkColumnState.Generated && this_1.areNeighborColumnsInState(chunkColumn, ChunkColumnState.Generated, true)) {
                this_1.updateChunkColumnState(chunkColumn, { is: ChunkColumnState.Decorating });
                chunkColumn.decorateTerrain().then(function () { return _this.updateChunkColumnState(chunkColumn, { is: ChunkColumnState.Decorated }); });
                return { value: void 0 };
            }
            if (state.is === ChunkColumnState.Decorated) {
                this_1.updateChunkColumnState(chunkColumn, { is: ChunkColumnState.Rendering });
                Promise.all(chunkColumn.chunks.map(function (chunk) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, chunk.buildMesh()];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, chunk.enableRebuilds()];
                            case 2:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); })).then(function () { return _this.updateChunkColumnState(chunkColumn, { is: ChunkColumnState.Rendered }); });
                return { value: void 0 };
            }
            out_i_1 = i;
        };
        var this_1 = this, out_i_1;
        for (var i = 0; i < this.loadedChunkColumns.length; i++) {
            var state_1 = _loop_1(i);
            i = out_i_1;
            if (typeof state_1 === "object")
                return state_1.value;
        }
    };
    ChunkColumnManager.prototype.updateChunkColumnState = function (chunkColumn, state) {
        var currentState = this.chunkColumnStates.get(chunkColumn);
        if (!currentState) {
            return;
            // throw new Error('Chunk column not registered');
        }
        this.chunkColumnStates.set(chunkColumn, __assign(__assign({}, currentState), state));
    };
    ChunkColumnManager.prototype.areNeighborColumnsInState = function (chunkColumn, expectedState, quadNeighbors) {
        var _this = this;
        if (quadNeighbors === void 0) { quadNeighbors = false; }
        return !__spreadArray([[-1, 0], [1, 0], [0, -1], [0, 1]], (quadNeighbors ? [[-1, -1], [-1, 1], [1, -1], [1, 1]] : []), true).some(function (offset) {
            var position = [chunkColumn.position[0] + offset[0], chunkColumn.position[1] + offset[1]];
            var neighbor = _this.getChunkColumn(position[0], position[1]);
            if (!neighbor) {
                return true;
            }
            var state = _this.chunkColumnStates.get(neighbor);
            return state === undefined || state.is < expectedState;
        });
    };
    ChunkColumnManager.prototype.lateUpdate = function (deltaTime) {
        this.loadedChunkColumns.forEach(function (chunkColumn) { return chunkColumn.lateUpdate(deltaTime); });
    };
    ChunkColumnManager.prototype.tick = function (deltaTime) {
        this.loadedChunkColumns.forEach(function (chunkColumn) { return chunkColumn.onTick(deltaTime); });
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
        return this.loadedChunkColumns.flatMap(function (column) { return column.getChunkMeshes(); });
    };
    ChunkColumnManager.prototype.calculateChunkColumnTargetState = function (x, z) {
        var absX = Math.abs(x);
        var absZ = Math.abs(z);
        if (absX < this.simulationDistance && absZ < this.simulationDistance) {
            return ChunkColumnState.Rendered;
        }
        if (absX < this.renderDistance && absZ < this.renderDistance) {
            return ChunkColumnState.Rendered;
        }
        if (absX < this.renderDistance + 1 && absZ < this.renderDistance + 1) {
            return ChunkColumnState.Decorated;
        }
        if (Math.abs(x) > this.renderDistance + 1 || Math.abs(z) > this.renderDistance + 1) {
            return ChunkColumnState.Unregistered;
        }
        return ChunkColumnState.Registered;
    };
    ChunkColumnManager.prototype.getChunkColumn = function (x, z) {
        return this.loadedChunkColumns.find(function (element) { return element.position[0] === x && element.position[1] === z; });
    };
    ChunkColumnManager.prototype.drop = function () {
        var _this = this;
        this.loadedChunkColumns.forEach(function (chunkColumn) { return chunkColumn.unregister(_this.scene); });
        this.loadedChunkColumns = [];
        this.chunkColumnStates.clear();
    };
    return ChunkColumnManager;
}());
export { ChunkColumnManager };
