import { expose } from 'comlink';
import { boolean, number } from 'fp-ts';
import SimplexNoise from 'simplex-noise';
import { Vector2 } from 'three';
import { lerp } from 'three/src/math/MathUtils';
import { AIR_BLOCK_ID, GRASS_BLOCK_ID, STONE_BLOCK_ID, WATER_BLOCK_ID } from '../../block/block-ids';
import { SmoothNoise } from '../../noise/smooth-noise';
import { indexToXZ } from '../../util/index-to-vector2';
import { xyzTupelToIndex } from '../../util/index-to-vector3';
import { ArrayMap2D, deserializeMap2D, Map2D, PaletteMap2D, SerializedMap2D } from '../../util/map-2d';
import { mod } from '../../util/mod';
import { Biome } from '../biome/biome';
import { BiomeGenerator } from '../biome/biome-generator';
import { BiomeMapGenerator } from '../biome/biome-map-generator';
import { WorldNoise } from '../world-noise';
import { CHUNK_HEIGHT, CHUNK_WIDTH } from './chunk-constants';

export class ChunkGenerator {
    private readonly biomeGenerator: BiomeGenerator;
    private readonly biomeMapGenerator: BiomeMapGenerator;

    private readonly worldNoise: WorldNoise;

    public constructor(readonly noiseSeed: number) {
        const smoothNoise = new SmoothNoise(new SimplexNoise(noiseSeed));
        this.biomeMapGenerator = new BiomeMapGenerator(smoothNoise);
        this.biomeGenerator = new BiomeGenerator(smoothNoise);

        this.worldNoise = new WorldNoise(noiseSeed);
    }

    public buildBaseTerrain(chunkPosition: [number, number, number], heightMap: SerializedMap2D<number>): Uint8Array {
        const heights = deserializeMap2D(heightMap);
        const blockData = new Uint8Array(CHUNK_WIDTH * CHUNK_HEIGHT * CHUNK_WIDTH);
        for (let i = 0; i < CHUNK_WIDTH * CHUNK_WIDTH; i += 1) {
            const [x, z] = indexToXZ(i, CHUNK_WIDTH).toArray();
            const height = heights.get(x, z);
            const ocean = height < 64;

            for (let y = 0; y < Math.max(height, 64); y++) {
                const chunkRow = Math.floor(y / 16);
                if (chunkRow === chunkPosition[1]) {
                    const worldX = chunkPosition[0] * CHUNK_WIDTH + x;
                    const worldY = chunkPosition[1] * CHUNK_HEIGHT + y;
                    const worldZ = chunkPosition[2] * CHUNK_WIDTH + z;
                    
                    let block = this.sampleBlock([worldX, worldY, worldZ], height);
                    if (block !== AIR_BLOCK_ID && Math.abs(worldY - height) < 4) {
                        block = 2;
                    }
                    if (worldY <= 64 && block === AIR_BLOCK_ID) {
                        // FIXME: There currently is no water in the game.
                        // block = WATER_BLOCK_ID;
                    }
                    blockData[xyzTupelToIndex(x, mod(y, 16), z, CHUNK_WIDTH, CHUNK_WIDTH)] = block;
                }
            }
        }

        return blockData;
    }

    private sampleBlock(worldPosition: [number, number, number], height: number): number {
        const factor3D = this.worldNoise.sample3DFactor(worldPosition[0], worldPosition[2]);
        const noise3D = this.worldNoise.sample3D(worldPosition[0], worldPosition[1], worldPosition[2]);

        const factor = lerp(
            worldPosition[1] < height ? 1 : -1,
            noise3D,
            factor3D,
        );

        return factor > 0 ? STONE_BLOCK_ID : AIR_BLOCK_ID;
    }

    public generateBiomeMap(chunkPosition: Vector2): Biome[] {
        const biomes: Biome[] = [];
        for (let i = 0; i < CHUNK_WIDTH * CHUNK_WIDTH; i += 1) {
            const position = indexToXZ(i, CHUNK_WIDTH);
            biomes[i] = this.biomeMapGenerator.sampleBiomeAt(new Vector2(
                position.x + chunkPosition.x * CHUNK_WIDTH,
                position.y + chunkPosition.y * CHUNK_WIDTH,
            ));
        }

        return biomes;
    }

    public generateHeightMap(chunkPosition: [number, number]): number[] {
        const height: number[] = [];
        for (let i = 0; i < CHUNK_WIDTH * CHUNK_WIDTH; i += 1) {
            const position = indexToXZ(i, CHUNK_WIDTH);
            const x = position.x + chunkPosition[0] * CHUNK_WIDTH;
            const z = position.y + chunkPosition[1] * CHUNK_WIDTH;
            height[i] = this.worldNoise.sampleErosion(x, z);
        }

        return height;
    }

    // TODO: Re-add terrain smoothing.
    // private getSmoothedHeightMapSample(localPosition: Vector2, worldPosition: Vector2, biomeMap: Map2D<Biome>, kernelSize: number) {
    //     let result = 0;
    //     for (let x = -kernelSize; x <= kernelSize; x++) {
    //         for (let y = -kernelSize; y <= kernelSize; y++) {
    //             result += this.biomeGenerator.sampleHeightAt(
    //                 biomeMap.getV(localPosition),
    //                 new Vector2(
    //                     worldPosition.x + x,
    //                     worldPosition.y + y,
    //                 ),
    //             );
    //         }
    //     }

    //     return result / 9;
    // }
}

expose(ChunkGenerator);
