import { expose } from "comlink";
import { SerializedBlockUvs } from "../../block/blocks";
import { BuildGeometryResult, ChunkRenderer } from "../chunk-renderer";

(globalThis as any).a = Math.random();

export class ChunkGeometryBuilder {
    private readonly chunkRenderer: ChunkRenderer;

    public constructor(
        readonly blockUvs: SerializedBlockUvs
    ) {
        console.log("hey!", (globalThis as any).a, globalThis.toString())
        this.chunkRenderer = new ChunkRenderer(
            blockUvs
        );
    }

    public buildGeometry(blockData: Uint8Array): BuildGeometryResult {
        return this.chunkRenderer.buildGeometry(blockData);
    }
}

expose(ChunkGeometryBuilder);
