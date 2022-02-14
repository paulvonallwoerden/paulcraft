import { Scene, Vector2 } from "three";
import { GRASS_BLOCK_ID } from "../block/block-ids";
import { BlockPos } from "../block/block-pos";
import { Chunk } from "./chunk";
import { ChunkColumn, ChunkColumnPriority } from "./chunk-column";

export class ChunkColumnManager {
    private readonly chunkColumns: Record<number, Record<number, ChunkColumn | undefined>> = {};
    private chunkColumnPositions: Array<[number, number]> = [];

    public constructor(
        private readonly scene: Scene,
        private readonly renderDistance: number,
        private readonly simulationDistance: number,
    ) {}

    public setCenter(centerX: number, centerZ: number) {
        const candidateRange = Math.max(this.renderDistance, this.simulationDistance);
        const candidates: { x: number, z: number, priority: ChunkColumnPriority }[] = [];
        for (let x = -candidateRange; x <= candidateRange; x += 1) {
            for (let z = -candidateRange; z <= candidateRange; z += 1) {
                candidates.push({
                    x: x + centerX,
                    z: z + centerZ,
                    priority: this.calculateChunkColumnPriority(x, z),
                });
            }
        }

        // Load new columns
        for (const candidate of candidates) {
            let chunkColumn = this.getChunkColumn(candidate.x, candidate.z);
            if (!chunkColumn) {
                chunkColumn = new ChunkColumn(this, [candidate.x, candidate.z], 8);
                chunkColumn.register(this.scene);
                this.setChunkColumn(candidate.x, candidate.z, chunkColumn);
            }
            chunkColumn.setPriority(candidate.priority);
        }

        // Unload old columns
        for (const [x, z] of this.chunkColumnPositions) {
            const remove = Math.abs(x - centerX) > this.renderDistance + 5 || Math.abs(z - centerZ) > this.renderDistance + 5;
            const chunkColumn = this.getChunkColumn(x, z);
            if (remove && chunkColumn) {
                chunkColumn.unregister(this.scene);
                this.setChunkColumn(x, z, undefined);
            }
        }
    }

    public update() {}

    public lateUpdate(deltaTime: number) {
        this.chunkColumnPositions.forEach(([x, z]) => {
            const chunkColumn = this.getChunkColumn(x, z);
            if (chunkColumn) {
                chunkColumn.lateUpdate(deltaTime);
            }
        });
    }

    public tick(deltaTime: number) {
        this.chunkColumnPositions.forEach(([x, z]) => {
            const chunkColumn = this.getChunkColumn(x, z);
            if (chunkColumn) {
                chunkColumn.onTick(deltaTime);
            }
        });
    }

    public getChunkByBlockPos(pos: BlockPos): Chunk | undefined {
        const x = Math.floor(pos.x / 16);
        const z = Math.floor(pos.z / 16);
        const column = this.getChunkColumn(x, z);
        if (!column) {
            return undefined;
        }

        const y = Math.floor(pos.y / 16);

        return column.chunks[y];
    }

    public __tempGetChunkMeshes() {
        return this.chunkColumnPositions.flatMap((cp) => this.chunkColumns[cp[0]][cp[1]]?.getChunkMeshes() ?? []);
    }

    private calculateChunkColumnPriority(x: number, z: number): ChunkColumnPriority {
        if (Math.abs(x) < this.simulationDistance && Math.abs(z) < this.simulationDistance) {
            return ChunkColumnPriority.High;
        }

        if (Math.abs(x) < this.renderDistance && Math.abs(z) < this.renderDistance) {
            return ChunkColumnPriority.Middle;
        }

        return ChunkColumnPriority.Low;
    }

    private setChunkColumn(x: number, z: number, chunkColumn: ChunkColumn | undefined): void {
        if (!this.chunkColumns[x]) {
            this.chunkColumns[x] = {};
        }

        if (chunkColumn !== undefined) {
            this.chunkColumnPositions.push([x, z]);
        } else {
            this.chunkColumnPositions = this.chunkColumnPositions.filter(([pX, pZ]) => pX !== x || pZ !== z);
        }

        this.chunkColumns[x][z] = chunkColumn;
    }

    public getChunkColumn(x: number, z: number): ChunkColumn | undefined {
        if (!this.chunkColumns[x]) {
            return;
        }

        return this.chunkColumns[x][z];
    }
}
