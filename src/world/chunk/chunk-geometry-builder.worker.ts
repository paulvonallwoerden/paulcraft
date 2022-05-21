import { expose } from "comlink";
import { SerializedBlockModels } from "../../block/blocks";
import { BuildGeometryResult, ChunkBlockData, ChunkRenderer } from "../chunk-renderer";

export class ChunkGeometryBuilder {
    private readonly chunkRenderer: ChunkRenderer;

    public constructor(
        readonly blockModels: SerializedBlockModels,
    ) {
        this.chunkRenderer = new ChunkRenderer(blockModels);
    }

    public buildGeometry(blockData: ChunkBlockData): BuildGeometryResult {
        return this.chunkRenderer.buildGeometry(blockData);
    }
}

expose(ChunkGeometryBuilder);
