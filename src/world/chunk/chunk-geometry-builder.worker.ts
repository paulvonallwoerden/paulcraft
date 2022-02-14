import { expose, transfer } from "comlink";
import { SerializedBlockUvs } from "../../block/blocks";
import { BuildGeometryResult, ChunkRenderer } from "../chunk-renderer";

(globalThis as any).a = Math.random();

export class ChunkGeometryBuilder {
    private readonly chunkRenderer: ChunkRenderer;

    public constructor(
        readonly blockUvs: SerializedBlockUvs
    ) {
        this.chunkRenderer = new ChunkRenderer(blockUvs);
    }

    public buildGeometry(blockData: Uint8Array[]): BuildGeometryResult {
        return this.chunkRenderer.buildGeometry(blockData);
    }
}

expose(ChunkGeometryBuilder);
