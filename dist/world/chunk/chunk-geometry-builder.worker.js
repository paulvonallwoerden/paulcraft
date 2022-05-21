import { expose } from "comlink";
import { ChunkRenderer } from "../chunk-renderer";
globalThis.a = Math.random();
var ChunkGeometryBuilder = /** @class */ (function () {
    function ChunkGeometryBuilder(blockModels) {
        this.blockModels = blockModels;
        this.chunkRenderer = new ChunkRenderer(blockModels);
    }
    ChunkGeometryBuilder.prototype.buildGeometry = function (blockData) {
        return this.chunkRenderer.buildGeometry(blockData);
    };
    return ChunkGeometryBuilder;
}());
export { ChunkGeometryBuilder };
expose(ChunkGeometryBuilder);
