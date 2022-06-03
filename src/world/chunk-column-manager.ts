import { Scene, Vector2 } from 'three';
import { BlockPos } from '../block/block-pos';
import { Chunk } from './chunk';
import { ChunkColumn } from './chunk-column';

enum ChunkColumnState {
    Unregistered = -1,
    Registered = 0,

    Generating = 1,
    Generated = 2,

    Decorating = 3,
    Decorated = 4,

    Rendering = 5,
    Rendered = 6,
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
                } else if(targetState !== ChunkColumnState.Unregistered) {
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

        const center = new Vector2(centerX, centerZ);
        this.loadedChunkColumns.sort((a, b) => {
            const aState = this.chunkColumnStates.get(a)!;
            const bState = this.chunkColumnStates.get(b)!;
            if (aState.target === ChunkColumnState.Unregistered && bState.target !== ChunkColumnState.Unregistered) {
                return Number.MIN_SAFE_INTEGER;
            }
            if (bState.target === ChunkColumnState.Unregistered && aState.target !== ChunkColumnState.Unregistered) {
                return Number.MAX_SAFE_INTEGER;
            }

            const aDist = new Vector2().fromArray(a.position).manhattanDistanceTo(center);
            const bDist = new Vector2().fromArray(b.position).manhattanDistanceTo(center);

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

                i += 1;

                continue;
            } else if (state.is > state.target) {
                continue;
            }

            if (state.is === ChunkColumnState.Registered) {
                this.updateChunkColumnState(chunkColumn, { is: ChunkColumnState.Generating });
                Promise.all(chunkColumn.chunks.map((chunk) => chunk.generateTerrain())).then(
                    () => this.updateChunkColumnState(chunkColumn, { is: ChunkColumnState.Generated }),
                );

                return;
            }

            if (state.is === ChunkColumnState.Generated && this.areNeighborColumnsInState(chunkColumn, ChunkColumnState.Generated, true)) {
                this.updateChunkColumnState(chunkColumn, { is: ChunkColumnState.Decorating });
                chunkColumn.decorateTerrain().then(() => this.updateChunkColumnState(chunkColumn, { is: ChunkColumnState.Decorated }));

                return;
            }

            if (state.is === ChunkColumnState.Decorated) {
                this.updateChunkColumnState(chunkColumn, { is: ChunkColumnState.Rendering });
                Promise.all(chunkColumn.chunks.map(async (chunk) => {
                    await chunk.buildMesh();
                    await chunk.enableRebuilds();
                })).then(
                    () => this.updateChunkColumnState(chunkColumn, { is: ChunkColumnState.Rendered }),
                );

                return;
            }
        }
    }

    private updateChunkColumnState(chunkColumn: ChunkColumn, state: { target?: ChunkColumnState, is?: ChunkColumnState }) {
        const currentState = this.chunkColumnStates.get(chunkColumn);
        if (!currentState) {
            return;
            // throw new Error('Chunk column not registered');
        }

        this.chunkColumnStates.set(chunkColumn, {
            ...currentState,
            ...state,
        });
    }

    private areNeighborColumnsInState(chunkColumn: ChunkColumn, expectedState: ChunkColumnState, quadNeighbors = false): boolean {
        return ![[-1, 0], [1, 0], [0, -1], [0, 1], ...(quadNeighbors ? [[-1, -1], [-1, 1], [1, -1], [1, 1]] : [])].some((offset) => {
            const position = [chunkColumn.position[0] + offset[0], chunkColumn.position[1] + offset[1]];
            const neighbor = this.getChunkColumn(position[0], position[1]); 
            if (!neighbor) {
                return true;
            }

            const state = this.chunkColumnStates.get(neighbor);

            return state === undefined || state.is < expectedState;
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

    public getChunk(pos: BlockPos): Chunk | undefined {
        const column = this.getChunkColumn(pos.x, pos.z);

        return column?.chunks[pos.y];
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
            return ChunkColumnState.Decorated;
        }

        if (Math.abs(x) > this.renderDistance + 1 || Math.abs(z) > this.renderDistance + 1) {
            return ChunkColumnState.Unregistered;
        }

        return ChunkColumnState.Registered;
    }

    public getChunkColumn(x: number, z: number): ChunkColumn | undefined {
        return this.loadedChunkColumns.find((element) => element.position[0] === x && element.position[1] === z);
    }

    public drop() {
        this.loadedChunkColumns.forEach((chunkColumn) => chunkColumn.unregister(this.scene));
        this.loadedChunkColumns = [];
        this.chunkColumnStates.clear();
    }

    public getChunkStateProgress(): number {
        let inTargetState = 0;
        let notInTargetState = 0;

        const states = this.chunkColumnStates.entries();
        let state = states.next();
        while (!state.done) {
            if (state.value[1].is >= state.value[1].target || state.value[1].target !== ChunkColumnState.Rendered) {
                inTargetState += 1;
            } else {
                notInTargetState += 1;
            }
            state = states.next();
        }

        return inTargetState / (inTargetState + notInTargetState);
    }
}
