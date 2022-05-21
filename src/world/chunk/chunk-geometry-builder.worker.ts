import { expose, transfer } from "comlink";
import { SerializedBlockModels } from "../../block/blocks";
import { BuildGeometryResult, ChunkRenderer } from "../chunk-renderer";

(globalThis as any).a = Math.random();

export class ChunkGeometryBuilder {
    private readonly chunkRenderer: ChunkRenderer;

    public constructor(
        readonly blockModels: SerializedBlockModels
    ) {
        this.chunkRenderer = new ChunkRenderer(blockModels);
    }

    public buildGeometry(blockData: Uint8Array[]): BuildGeometryResult {
        return this.chunkRenderer.buildGeometry(blockData);
    }
}

expose(ChunkGeometryBuilder);
