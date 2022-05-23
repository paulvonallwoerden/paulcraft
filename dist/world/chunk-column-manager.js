import { Vector2 } from 'three';
import { ChunkColumn } from './chunk-column';
var ChunkColumnState;
(function (ChunkColumnState) {
    ChunkColumnState[ChunkColumnState["Unregistered"] = -1] = "Unregistered";
    ChunkColumnState[ChunkColumnState["Registered"] = 0] = "Registered";
    ChunkColumnState[ChunkColumnState["Generating"] = 1] = "Generating";
    ChunkColumnState[ChunkColumnState["Generated"] = 2] = "Generated";
    ChunkColumnState[ChunkColumnState["Rendering"] = 3] = "Rendering";
    ChunkColumnState[ChunkColumnState["Rendered"] = 4] = "Rendered";
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
                else {
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
        this.loadedChunkColumns.sort(function (a, b) {
            var aDist = new Vector2().fromArray(a.position).distanceTo(new Vector2(centerX, centerZ));
            var bDist = new Vector2().fromArray(b.position).distanceTo(new Vector2(centerX, centerZ));
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
                i--;
                return out_i_1 = i, "continue";
            }
            if (state.is === ChunkColumnState.Registered) {
                this_1.chunkColumnStates.set(chunkColumn, { is: ChunkColumnState.Generating, target: state.target });
                Promise.all(chunkColumn.chunks.map(function (chunk) { return chunk.generateTerrain(); })).then(function () {
                    var currentState = _this.chunkColumnStates.get(chunkColumn);
                    _this.chunkColumnStates.set(chunkColumn, { is: ChunkColumnState.Generated, target: currentState.target });
                });
                return { value: void 0 };
            }
            if (state.is === ChunkColumnState.Generated && this_1.areNeighborColumnsGenerated(chunkColumn)) {
                this_1.chunkColumnStates.set(chunkColumn, { is: ChunkColumnState.Rendering, target: state.target });
                Promise.all(chunkColumn.chunks.map(function (chunk) { return chunk.buildMesh(); })).then(function () {
                    var currentState = _this.chunkColumnStates.get(chunkColumn);
                    _this.chunkColumnStates.set(chunkColumn, { is: ChunkColumnState.Rendered, target: currentState.target });
                });
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
    ChunkColumnManager.prototype.areNeighborColumnsGenerated = function (chunkColumn) {
        var _this = this;
        return ![[-1, 0], [1, 0], [0, -1], [0, 1]].some(function (offset) {
            var position = [chunkColumn.position[0] + offset[0], chunkColumn.position[1] + offset[1]];
            var neighbor = _this.getChunkColumn(position[0], position[1]);
            if (!neighbor) {
                return true;
            }
            var state = _this.chunkColumnStates.get(neighbor);
            return state === undefined || state.is < ChunkColumnState.Generated;
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
            return ChunkColumnState.Generated;
        }
        if (Math.abs(x) > this.renderDistance + 1 || Math.abs(z) > this.renderDistance + 1) {
            return ChunkColumnState.Unregistered;
        }
        return ChunkColumnState.Registered;
    };
    ChunkColumnManager.prototype.getChunkColumn = function (x, z) {
        return this.loadedChunkColumns.find(function (element) { return element.position[0] === x && element.position[1] === z; });
    };
    return ChunkColumnManager;
}());
export { ChunkColumnManager };
