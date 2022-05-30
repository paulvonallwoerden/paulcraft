import { Remote, wrap } from "comlink";
import { Blocks, SerializedBlockModels } from "../../block/blocks";
import { WorkerPool } from "../../worker/worker-pool";
import { ChunkBlockData, ChunkMeshData } from "../chunk-renderer";
import ChunkGeometryBuilderWorker from "./chunk-geometry-builder.worker.ts";
import { ChunkGeometryBuilder } from "./chunk-geometry-builder.worker";
import { BufferAttribute, BufferGeometry } from "three";
import { BlockPos } from "../../block/block-pos";

export class ChunkGeometryBuilderPool extends WorkerPool<ChunkGeometryBuilder> {
    public constructor(private readonly blockModels: SerializedBlockModels) {
        super();
    }

    public async buildGeometry(chunkPosition: BlockPos, blockData: ChunkBlockData): Promise<{
        solid: BufferGeometry,
        water: BufferGeometry,
        transparent: BufferGeometry,
    }> {
        const { solid, water, transparent } = await this.getWorker().buildGeometry(chunkPosition, blockData);

        return {
            solid: this.getGeometryFromChunkMeshData(solid),
            water: this.getGeometryFromChunkMeshData(water),
            transparent: this.getGeometryFromChunkMeshData(transparent),
        };
    }

    private getGeometryFromChunkMeshData(chunkMeshData: ChunkMeshData): BufferGeometry {
        const geometry = new BufferGeometry();
        // Geometry
        geometry.setAttribute('position', new BufferAttribute(chunkMeshData.vertices, 3));
        geometry.setAttribute('normal', new BufferAttribute(chunkMeshData.normals, 3));
        geometry.setAttribute('uv', new BufferAttribute(chunkMeshData.uv, 2));
        geometry.setIndex(chunkMeshData.triangles);

        // Lighting
        geometry.setAttribute('blockLight', new BufferAttribute(chunkMeshData.blockLight, 1));
        geometry.setAttribute('skyLight', new BufferAttribute(chunkMeshData.skyLight, 1));
        geometry.setAttribute('foliage', new BufferAttribute(chunkMeshData.foliage, 1));

        return geometry;
    }

    protected async instantiateWorker(): Promise<Remote<ChunkGeometryBuilder>> {
        return new (wrap<typeof ChunkGeometryBuilder>(new ChunkGeometryBuilderWorker()))(
            this.blockModels,
        );
    }
}
