import { expose } from "comlink";
import { BlockPos } from "../../block/block-pos";
import { SerializedBlockModels } from "../../block/blocks";
import { BuildGeometryResult, ChunkBlockData, ChunkRenderer } from "../chunk-renderer";

export class ChunkGeometryBuilder {
    private readonly chunkRenderer: ChunkRenderer;

    public constructor(
        readonly blockModels: SerializedBlockModels,
    ) {
        this.chunkRenderer = new ChunkRenderer(blockModels);
    }

    public buildGeometry(chunkPosition: BlockPos, blockData: ChunkBlockData): BuildGeometryResult {
        return this.chunkRenderer.buildGeometry(chunkPosition, blockData);
    }
}

expose(ChunkGeometryBuilder);
