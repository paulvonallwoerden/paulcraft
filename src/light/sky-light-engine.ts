import { BlockFace, blockFaceByNormal } from '../block/block-face';
import { BlockPos } from '../block/block-pos';
import { mod } from '../util/mod';
import { Chunk } from '../world/chunk';
import { ChunkColumnManager } from '../world/chunk-column-manager';
import { CHUNK_WIDTH } from '../world/chunk/chunk-constants';
import { LightEngine } from './light-engine';

export class SkyLightEngine extends LightEngine {
    public constructor(chunkColumnManager: ChunkColumnManager) {
        super(chunkColumnManager, SkyLightEngine.setSkyLight, SkyLightEngine.getSkyLight);
    }

    public floodChunk(chunk: Chunk) {
        const column = this.chunkColumnManager.getChunkColumn(chunk.position.x, chunk.position.z);
        if (column === undefined) {
            throw new Error('Can\'t flood chunk, column isn\'t loaded!');
        }

        const worldY = 16 * 8 - 1;
        for (let x = 0; x < CHUNK_WIDTH; x += 1) {
            for (let z = 0; z < CHUNK_WIDTH; z += 1) {
                const worldX = chunk.position.x * CHUNK_WIDTH + x;
                const worldZ = chunk.position.z * CHUNK_WIDTH + z;
                this.addLight({ x: worldX, y: worldY, z: worldZ }, 15);
            }
        }

        // let d = 0;
        // let l = 0;
        // for (let x = 0; x < CHUNK_WIDTH; x += 1) {
        //     for (let z = 0; z < CHUNK_WIDTH; z += 1) {
        //         const worldX = chunk.position.x * CHUNK_WIDTH + x;
        //         const worldZ = chunk.position.z * CHUNK_WIDTH + z;
        //         for (let y = CHUNK_WIDTH * 8 - 1; y >= 0; y -= 1) {
        //             const block = column.getBlockAt([x, y, z]);
        //             const curChunk = this.chunkColumnManager.getChunk({
        //                 x: chunk.position.x,
        //                 y: Math.floor(y / 16),
        //                 z: chunk.position.z,
        //             });

        //             if (block === undefined || block.blocksLight === false) {
        //                 this.setLightLevel(curChunk!, { x, y: mod(y, 16), z }, 15);
        //                 d++;
        //             } else {
        //                 this.addLight({ x: worldX, y: y + 1, z: worldZ }, 15);
        //                 l++;

        //                 for (let yy = y; yy >= 0; yy -= 1) {
        //                     this.setLightLevel(curChunk!, { x, y: mod(y, 16), z }, 0);
        //                 }

        //                 break;
        //             }
        //         }
        //     }
        // }
    }

    protected calculateLightLoss(direction: BlockPos): number {
        if (blockFaceByNormal(direction) === BlockFace.BOTTOM) {
            return 0;
        }

        return 1;
    }

    protected static setSkyLight(chunk: Chunk, pos: BlockPos, lightLevel: number): void {
        chunk.setSkyLight(pos, lightLevel);
    }

    protected static getSkyLight(chunk: Chunk, pos: BlockPos): number {
        return chunk.getSkyLight(pos);
    }
}
