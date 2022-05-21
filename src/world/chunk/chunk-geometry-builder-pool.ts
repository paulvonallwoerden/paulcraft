import { Remote, wrap } from "comlink";
import { Blocks, SerializedBlockModels } from "../../block/blocks";
import { WorkerPool } from "../../worker/worker-pool";
import { ChunkBlockData, ChunkMeshData } from "../chunk-renderer";
import ChunkGeometryBuilderWorker from "./chunk-geometry-builder.worker.ts";
import { ChunkGeometryBuilder } from "./chunk-geometry-builder.worker";
import { BufferAttribute, BufferGeometry } from "three";

export class ChunkGeometryBuilderPool extends WorkerPool<ChunkGeometryBuilder> {
    private blockModels?: SerializedBlockModels;

    public constructor() {
        super();
    }

    public init(blocks: Blocks) {
        this.blockModels = blocks.serializeBlockModels();
    }

    public async buildGeometry(blockData: ChunkBlockData): Promise<{ solid: BufferGeometry, water: BufferGeometry, transparent: BufferGeometry }> {
        const { solid, water, transparent } = await this.getWorker().buildGeometry(blockData);

        return {
            solid: this.getGeometryFromChunkMeshData(solid),
            water: this.getGeometryFromChunkMeshData(water),
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
        if (!this.blockModels) {
            throw new Error('Can\'t instantiate chunk geometry builder worker!');
        }

        return new (wrap<typeof ChunkGeometryBuilder>(new ChunkGeometryBuilderWorker()))(
            this.blockModels,
        );
    }
}
