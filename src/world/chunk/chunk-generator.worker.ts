import { expose } from 'comlink';
import AleaRandom from 'alea';
import SimplexNoise from 'simplex-noise';
import { Vector2, Vector2Tuple, Vector3, Vector3Tuple } from 'three';
import { lerp } from 'three/src/math/MathUtils';
import { Block } from '../../block/block';
import { BlockPos, isBlockPosIn, modifyBlockPosValues, sumBlockPos } from '../../block/block-pos';
import { Blocks } from '../../block/blocks';
import { SmoothNoise } from '../../noise/smooth-noise';
import { indexToXZ } from '../../util/index-to-vector2';
import { indexToXZY, xyzTupelToIndex, xzyToIndex } from '../../util/index-to-vector3';
import { SerializedMap2D } from '../../util/map-2d';
import { mod } from '../../util/mod';
import { Biome } from '../biome/biome';
import { BiomeGenerator } from '../biome/biome-generator';
import { BiomeMapGenerator } from '../biome/biome-map-generator';
import { OakTreeFeature } from '../feature/oak-tree-feature';
import { buildFeatureVariant, BuildFeatureVariantResult } from '../feature/world-feature';
import { WorldNoise } from '../world-noise';
import { CHUNK_HEIGHT, CHUNK_WIDTH } from './chunk-constants';
import { boolean, tree } from 'fp-ts';

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
                    blockData[xyzTupelToIndex(x, mod(y, 16), z, CHUNK_WIDTH, CHUNK_WIDTH)] = worldY < 64 ? Blocks.WATER : Blocks.AIR;

                    continue;
                }

                blockData[xyzTupelToIndex(x, mod(y, 16), z, CHUNK_WIDTH, CHUNK_WIDTH)] = Blocks.STONE;
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

    public decorateTerrain(chunkPosition: Vector2Tuple, blockData: Uint8Array[]): Uint8Array[] {
        return this.decorateBaseTerrain(chunkPosition, blockData);
    }

    private decorateBaseTerrain(chunkPosition: Vector2Tuple, blockData: Uint8Array[]): Uint8Array[] {
        const getBlock = (x: number, theY: number, z: number) => {
            const theSection = Math.floor(theY / 16);
            const theIndex = xyzTupelToIndex(x, theY % 16, z, CHUNK_WIDTH, CHUNK_WIDTH);

            return Blocks.getBlockById(blockData[theSection][theIndex]);
        };
        const setBlock = (x: number, theY: number, z: number, block: Block) => {
            const theSection = Math.floor(theY / 16);
            const theIndex = xyzTupelToIndex(x, theY % 16, z, CHUNK_WIDTH, CHUNK_WIDTH);

            blockData[theSection][theIndex] = Blocks.getBlockId(block);
        };

        for (let i = 0; i < CHUNK_WIDTH * CHUNK_WIDTH; i += 1) {
            const { x, y: z } = indexToXZ(i, CHUNK_WIDTH);

            let isTreeGoodHere = !((x !== 1 || z !== 10) && (x !== 1 || z !== 1) && (x !== 10 || z !== 1) && (x !== 10 || z !== 10));
            for (let y = CHUNK_HEIGHT * 8 - 1; y >= 0; y -= 1) {
                const section = Math.floor(y / 16);
                const index = xyzTupelToIndex(x, y % 16, z, CHUNK_WIDTH, CHUNK_WIDTH);
                const block = Blocks.getBlockById(blockData[section][index]);
                if (block === Blocks.STONE && getBlock(x, y + 1, z) === Blocks.WATER) {
                    blockData[section][index] = Blocks.getBlockId(Blocks.SAND);

                    continue;
                }

                if (block === Blocks.STONE && getBlock(x, y + 1, z) === Blocks.AIR) {
                    // blockData[section][index] = Blocks.getBlockId(Blocks.GRASS);
                    setBlock(x, y, z, Blocks.GRASS);
                    if (getBlock(x, y - 1, z) === Blocks.STONE) setBlock(x, y - 1, z, Blocks.DIRT);
                    if (getBlock(x, y - 2, z) === Blocks.STONE) setBlock(x, y - 2, z, Blocks.DIRT);
                    if (getBlock(x, y - 3, z) === Blocks.STONE) setBlock(x, y - 3, z, Blocks.DIRT);

                    continue;
                }

                if (block === Blocks.WATER) {
                    isTreeGoodHere = false;
                }

                if (block === Blocks.AIR) {
                    continue;
                }

                if (isTreeGoodHere) {
                    const feature = buildFeatureVariant(OakTreeFeature.variants[0]);
                    this.placeFeature({ x, y, z }, feature, (pos, block) => {
                        const ss = Math.floor(pos.y / 16);
                        const ind = xyzTupelToIndex(pos.x, pos.y % 16, pos.z, CHUNK_WIDTH, CHUNK_WIDTH);
                        blockData[ss][ind] = Blocks.getBlockId(block);
                    });

                    break;
                }
            }
        }

        return blockData;
    }

    private placeFeature(
        position: BlockPos,
        { blocks: featureBlocks, depth, height, width }: BuildFeatureVariantResult,
        setBlock: (pos: BlockPos, block: Block) => void,
    ): void {
        // const { x, y, z } = position;
        for (let i = 0; i < featureBlocks.length; i += 1) {
            const block = featureBlocks[i];
            if (block === undefined) {
                continue;
            }

            const blockPos = indexToXZY(i, width, depth);
            const pos = sumBlockPos(position, { x: -Math.floor(width / 2), y: 0, z: -Math.floor(depth / 2) }, blockPos);
            if (isBlockPosIn(pos, { x: 0, y: 0, z: 0 }, { x: CHUNK_WIDTH - 1, y: CHUNK_HEIGHT * 8 - 1, z: CHUNK_WIDTH - 1 })) {
                setBlock(pos, block);
            }
        }
    }
}

expose(ChunkGenerator);
