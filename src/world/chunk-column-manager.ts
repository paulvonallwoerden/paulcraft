import { Scene, Vector2 } from 'three';
import { BlockPos } from '../block/block-pos';
import { Chunk } from './chunk';
import { ChunkColumn } from './chunk-column';

enum ChunkColumnState {
    Unregistered = -1,
    Registered = 0,
    Generating = 1,
    Generated = 2,
    Rendering = 3,
    Rendered = 4,
}

export class ChunkColumnManager {
    private loadedChunkColumns: ChunkColumn[] = [];
    private chunkColumnStates: Map<ChunkColumn, { target: ChunkColumnState, is: ChunkColumnState }> = new Map();

    public constructor(
        private readonly scene: Scene,
        private readonly renderDistance: number,
        private readonly simulationDistance: number,
        private readonly chunkUpdateConcurrency: number,
    ) {}

    public setCenter(centerX: number, centerZ: number) {
        const range = Math.max(this.renderDistance, this.simulationDistance) + 2;
        for (let offsetX = -range; offsetX <= range; offsetX += 1) {
            for (let offsetZ = -range; offsetZ <= range; offsetZ += 1) {
                const x = centerX + offsetX;
                const z = centerZ + offsetZ;
                const targetState = this.calculateChunkColumnTargetState(offsetX, offsetZ);

                const maybeExistingColumn = this.getChunkColumn(x, z);
                if (maybeExistingColumn) {
                    const currentState = this.chunkColumnStates.get(maybeExistingColumn)!;
                    this.chunkColumnStates.set(maybeExistingColumn, {
                        is: currentState.is,
                        target: targetState,
                    });
                } else {
                    const newColumn = new ChunkColumn(this, [x, z], 8);
                    this.loadedChunkColumns.push(newColumn);
                    newColumn.register(this.scene);

                    this.chunkColumnStates.set(newColumn, {
                        is: ChunkColumnState.Registered,
                        target: targetState,
                    });
                }
            }
        }

        this.loadedChunkColumns.sort((a, b) => {
            const aDist = new Vector2().fromArray(a.position).distanceTo(new Vector2(centerX, centerZ));
            const bDist = new Vector2().fromArray(b.position).distanceTo(new Vector2(centerX, centerZ));

            return aDist - bDist;
        });
    }

    public update(deltaTime: number) {
        for (let i = 0; i < this.loadedChunkColumns.length; i++) {
            const chunkColumn = this.loadedChunkColumns[i];
            const state = this.chunkColumnStates.get(chunkColumn)!;
            if (state.is === state.target) {
                continue;
            }

            if (state.is > state.target && state.target === ChunkColumnState.Unregistered) {
                this.loadedChunkColumns.splice(i, 1);
                chunkColumn.unregister(this.scene);
                this.chunkColumnStates.delete(chunkColumn);

                i--;

                continue;
            }

            if (state.is === ChunkColumnState.Registered) {
                this.chunkColumnStates.set(chunkColumn, { is: ChunkColumnState.Generating, target: state.target });
                Promise.all(chunkColumn.chunks.map((chunk) => chunk.generateTerrain())).then(() => {
                    const currentState = this.chunkColumnStates.get(chunkColumn)!;
                    this.chunkColumnStates.set(chunkColumn, { is: ChunkColumnState.Generated, target: currentState.target });
                });

                return;
            }

            if (state.is === ChunkColumnState.Generated && this.areNeighborColumnsGenerated(chunkColumn)) {
                this.chunkColumnStates.set(chunkColumn, { is: ChunkColumnState.Rendering, target: state.target });
                Promise.all(chunkColumn.chunks.map((chunk) => chunk.buildMesh())).then(() => {
                    const currentState = this.chunkColumnStates.get(chunkColumn)!;
                    this.chunkColumnStates.set(chunkColumn, { is: ChunkColumnState.Rendered, target: currentState.target });
                });

                return;
            }
        }
    }

    private areNeighborColumnsGenerated(chunkColumn: ChunkColumn): boolean {
        return ![[-1, 0], [1, 0], [0, -1], [0, 1]].some((offset) => {
            const position = [chunkColumn.position[0] + offset[0], chunkColumn.position[1] + offset[1]];
            const neighbor = this.getChunkColumn(position[0], position[1]); 
            if (!neighbor) {
                return true;
            }

            const state = this.chunkColumnStates.get(neighbor);

            return state === undefined || state.is < ChunkColumnState.Generated;
        });
    }

    public lateUpdate(deltaTime: number) {
        this.loadedChunkColumns.forEach((chunkColumn) => chunkColumn.lateUpdate(deltaTime));
    }

    public tick(deltaTime: number) {
        this.loadedChunkColumns.forEach((chunkColumn) => chunkColumn.onTick(deltaTime));
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
        return this.loadedChunkColumns.flatMap((column) => column.getChunkMeshes());
    }

    private calculateChunkColumnTargetState(x: number, z: number): ChunkColumnState {
        const absX = Math.abs(x);
        const absZ = Math.abs(z);
        if (absX < this.simulationDistance && absZ < this.simulationDistance) {
            return ChunkColumnState.Rendered;
        }

        if (absX < this.renderDistance && absZ < this.renderDistance) {
            return ChunkColumnState.Rendered;
        }

        if (absX < this.renderDistance + 1 && absZ < this.renderDistance + 1) {
            return ChunkColumnState.Generated;
        }

        if (Math.abs(x) > this.renderDistance + 1 || Math.abs(z) > this.renderDistance + 1) {
            return ChunkColumnState.Unregistered;
        }

        return ChunkColumnState.Registered;
    }

    public getChunkColumn(x: number, z: number): ChunkColumn | undefined {
        return this.loadedChunkColumns.find((element) => element.position[0] === x && element.position[1] === z);
    }
}
