import { Remote, wrap } from "comlink";
import { Blocks, SerializedBlockUvs } from "../../block/blocks";
import { WorkerPool } from "../../worker/worker-pool";
import { ChunkMeshData } from "../chunk-renderer";
import ChunkGeometryBuilderWorker from "./chunk-geometry-builder.worker.ts";
import { ChunkGeometryBuilder } from "./chunk-geometry-builder.worker";
import { BufferAttribute, BufferGeometry } from "three";

export class ChunkGeometryBuilderPool extends WorkerPool<ChunkGeometryBuilder> {
    private blockUvs?: SerializedBlockUvs;

    public constructor() {
        super();
    }

    public init(blocks: Blocks) {
        this.blockUvs = blocks.serializeBlockUvs();
    }

    public async buildGeometry(blockData: Uint8Array): Promise<{ solid: BufferGeometry, transparent: BufferGeometry }> {
        const { solid, transparent } = await this.getWorker().buildGeometry(blockData);

        return {
            solid: this.getGeometryFromChunkMeshData(solid),
            transparent: this.getGeometryFromChunkMeshData(transparent),
        };
    }

    private getGeometryFromChunkMeshData(chunkMeshData: ChunkMeshData): BufferGeometry {
        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new BufferAttribute(chunkMeshData.vertices, 3));
        geometry.setAttribute('normal', new BufferAttribute(chunkMeshData.normals, 3));
        geometry.setAttribute('uv', new BufferAttribute(chunkMeshData.uv, 2));
        geometry.setIndex(chunkMeshData.triangles);

        return geometry;
    }

    protected async instantiateWorker(): Promise<Remote<ChunkGeometryBuilder>> {
        if (!this.blockUvs) {
            throw new Error('Can\'t instantiate chunk geometry builder worker!');
        }

        return new (wrap<typeof ChunkGeometryBuilder>(new ChunkGeometryBuilderWorker()))(
            this.blockUvs,
        );
    }
}
