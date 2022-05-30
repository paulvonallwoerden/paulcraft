import { expose } from "comlink";
import { ChunkRenderer } from "../chunk-renderer";
var ChunkGeometryBuilder = /** @class */ (function () {
    function ChunkGeometryBuilder(blockModels) {
        this.blockModels = blockModels;
        this.chunkRenderer = new ChunkRenderer(blockModels);
    }
    ChunkGeometryBuilder.prototype.buildGeometry = function (chunkPosition, blockData) {
        return this.chunkRenderer.buildGeometry(chunkPosition, blockData);
    };
    return ChunkGeometryBuilder;
}());
export { ChunkGeometryBuilder };
expose(ChunkGeometryBuilder);
