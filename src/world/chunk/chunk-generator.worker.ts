import { expose } from 'comlink';
import { number } from 'fp-ts';
import SimplexNoise from 'simplex-noise';
import { Vector2, Vector3Tuple } from 'three';
import { lerp } from 'three/src/math/MathUtils';
import { Block } from '../../block/block';
import { Blocks } from '../../block/blocks';
import { SmoothNoise } from '../../noise/smooth-noise';
import { indexToXZ } from '../../util/index-to-vector2';
import { xyzTupelToIndex } from '../../util/index-to-vector3';
import { SerializedMap2D } from '../../util/map-2d';
import { mod } from '../../util/mod';
import { Biome } from '../biome/biome';
import { BiomeGenerator } from '../biome/biome-generator';
import { BiomeMapGenerator } from '../biome/biome-map-generator';
import { WorldNoise } from '../world-noise';
import { CHUNK_HEIGHT, CHUNK_WIDTH } from './chunk-constants';

// TODO: Find a way to make this algorithm easier to work with. Tuning these numbers is an absolute mess!
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

    public buildTerrain(chunkPosition: Vector3Tuple): Uint8Array {
        const blocks = this.buildBaseTerrain(chunkPosition);
        // const decoratedBlocks = this.decorateTerrain(blocks);

        return Uint8Array.from(blocks.map((block) => Blocks.getBlockId(block)));
    }

    private buildBaseTerrain([chunkPositionX, chunkPositionY, chunkPositionZ]: Vector3Tuple): Block[] {
        const blockData: Block[] = [];
        for (let i = 0; i < CHUNK_WIDTH * CHUNK_WIDTH; i += 1) {
            const [x, z] = indexToXZ(i, CHUNK_WIDTH).toArray();
            const erosion = this.worldNoise.sampleErosion(x + chunkPositionX * CHUNK_WIDTH, z + chunkPositionZ * CHUNK_WIDTH);

            const worldX = chunkPositionX * CHUNK_WIDTH + x;
            const worldZ = chunkPositionZ * CHUNK_WIDTH + z;
            const factor3D = this.worldNoise.sample3DFactor(worldX, worldZ);
            for (let y = 0; y < CHUNK_HEIGHT; y++) {
                const worldY = chunkPositionY * CHUNK_HEIGHT + y;
                const isBlock = this.sampleIsBlock([worldX, worldY, worldZ], erosion, factor3D);
                if (!isBlock) {
                    blockData[xyzTupelToIndex(x, mod(y, 16), z, CHUNK_WIDTH, CHUNK_WIDTH)] = Blocks.AIR;

                    continue;
                }

                const isBlockAbove = this.sampleIsBlock([worldX, worldY + 1, worldZ], erosion, factor3D);
                blockData[xyzTupelToIndex(x, mod(y, 16), z, CHUNK_WIDTH, CHUNK_WIDTH)] = isBlockAbove ? Blocks.STONE : Blocks.GRASS;
            }
        }

        return blockData;
    }

    private sampleIsBlock([worldX, worldY, worldZ]: Vector3Tuple, erosion: number, factor3D: number): boolean {
        // 3D Map
        const heightFactor = (worldY / 128) * 10 - 6;
        const s = (1 / (1 + Math.exp(-heightFactor)));
        const noise3d = (this.worldNoise.sample3D(worldX, worldY, worldZ) + 1) / 2;
        const sample3d = noise3d - s;

        // Base Map
        const sampleFlat = ((erosion / 4 + 0.45) - (worldY / 128)) * 0.7;

        // Final Map
        const sample = lerp(sampleFlat, sample3d, (factor3D + 1) / 2);

        return sample > 0;
    }

    // TODO: Remove this. It is unused. Biomes should be declared after the terrain is generated. Biomes should not be
    // a template for generating terrain. This will result in a more diverse world where biomes aren't bound to specific
    // terrain types.
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

    // TODO: Remove this. It is unused.
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
}

expose(ChunkGenerator);
