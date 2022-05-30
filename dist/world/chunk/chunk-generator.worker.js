import { expose } from 'comlink';
import SimplexNoise from 'simplex-noise';
import { lerp } from 'three/src/math/MathUtils';
import { isBlockPosIn, sumBlockPos } from '../../block/block-pos';
import { Blocks } from '../../block/blocks';
import { SmoothNoise } from '../../noise/smooth-noise';
import { indexToXZ } from '../../util/index-to-vector2';
import { indexToXZY, xyzTupelToIndex } from '../../util/index-to-vector3';
import { mod } from '../../util/mod';
import { BiomeGenerator } from '../biome/biome-generator';
import { BiomeMapGenerator } from '../biome/biome-map-generator';
import { OakTreeFeature } from '../feature/oak-tree-feature';
import { buildFeatureVariant } from '../feature/world-feature';
import { WorldNoise } from '../world-noise';
import { CHUNK_HEIGHT, CHUNK_WIDTH } from './chunk-constants';
// TODO: Find a way to make this algorithm easier to work with. Tuning these numbers is an absolute mess!
var ChunkGenerator = /** @class */ (function () {
    function ChunkGenerator(noiseSeed) {
        this.noiseSeed = noiseSeed;
        var smoothNoise = new SmoothNoise(new SimplexNoise(noiseSeed));
        this.biomeMapGenerator = new BiomeMapGenerator(smoothNoise);
        this.biomeGenerator = new BiomeGenerator(smoothNoise);
        this.worldNoise = new WorldNoise(noiseSeed);
    }
    ChunkGenerator.prototype.buildTerrain = function (chunkPosition) {
        var blocks = this.buildBaseTerrain(chunkPosition);
        return Uint8Array.from(blocks.map(function (block) { return Blocks.getBlockId(block); }));
    };
    ChunkGenerator.prototype.buildBaseTerrain = function (_a) {
        var chunkPositionX = _a[0], chunkPositionY = _a[1], chunkPositionZ = _a[2];
        var blockData = [];
        for (var i = 0; i < CHUNK_WIDTH * CHUNK_WIDTH; i += 1) {
            var _b = indexToXZ(i, CHUNK_WIDTH).toArray(), x = _b[0], z = _b[1];
            var erosion = this.worldNoise.sampleErosion(x + chunkPositionX * CHUNK_WIDTH, z + chunkPositionZ * CHUNK_WIDTH);
            var worldX = chunkPositionX * CHUNK_WIDTH + x;
            var worldZ = chunkPositionZ * CHUNK_WIDTH + z;
            var factor3D = this.worldNoise.sample3DFactor(worldX, worldZ);
            for (var y = 0; y < CHUNK_HEIGHT; y++) {
                var worldY = chunkPositionY * CHUNK_HEIGHT + y;
                var isBlock = this.sampleIsBlock([worldX, worldY, worldZ], erosion, factor3D);
                if (!isBlock) {
                    blockData[xyzTupelToIndex(x, mod(y, 16), z, CHUNK_WIDTH, CHUNK_WIDTH)] = worldY < 64 ? Blocks.WATER : Blocks.AIR;
                    continue;
                }
                blockData[xyzTupelToIndex(x, mod(y, 16), z, CHUNK_WIDTH, CHUNK_WIDTH)] = Blocks.STONE;
            }
        }
        return blockData;
    };
    ChunkGenerator.prototype.sampleIsBlock = function (_a, erosion, factor3D) {
        var worldX = _a[0], worldY = _a[1], worldZ = _a[2];
        // 3D Map
        var heightFactor = (worldY / 128) * 10 - 6;
        var s = (1 / (1 + Math.exp(-heightFactor)));
        var noise3d = (this.worldNoise.sample3D(worldX, worldY, worldZ) + 1) / 2;
        var sample3d = noise3d - s;
        // Base Map
        var sampleFlat = ((erosion / 4 + 0.45) - (worldY / 128)) * 0.7;
        // Final Map
        var sample = lerp(sampleFlat, sample3d, (factor3D + 1) / 2);
        return sample > 0;
    };
    ChunkGenerator.prototype.decorateTerrain = function (chunkPosition, blockData) {
        return this.decorateBaseTerrain(chunkPosition, blockData);
    };
    ChunkGenerator.prototype.decorateBaseTerrain = function (chunkPosition, blockData) {
        var getBlock = function (x, theY, z) {
            var theSection = Math.floor(theY / 16);
            var theIndex = xyzTupelToIndex(x, theY % 16, z, CHUNK_WIDTH, CHUNK_WIDTH);
            return Blocks.getBlockById(blockData[theSection][theIndex]);
        };
        var setBlock = function (x, theY, z, block) {
            var theSection = Math.floor(theY / 16);
            var theIndex = xyzTupelToIndex(x, theY % 16, z, CHUNK_WIDTH, CHUNK_WIDTH);
            blockData[theSection][theIndex] = Blocks.getBlockId(block);
        };
        for (var i = 0; i < CHUNK_WIDTH * CHUNK_WIDTH; i += 1) {
            var _a = indexToXZ(i, CHUNK_WIDTH), x = _a.x, z = _a.y;
            var isTreeGoodHere = !((x !== 1 || z !== 10) && (x !== 1 || z !== 1) && (x !== 10 || z !== 1) && (x !== 10 || z !== 10));
            for (var y = CHUNK_HEIGHT * 8 - 1; y >= 0; y -= 1) {
                var section = Math.floor(y / 16);
                var index = xyzTupelToIndex(x, y % 16, z, CHUNK_WIDTH, CHUNK_WIDTH);
                var block = Blocks.getBlockById(blockData[section][index]);
                if (block === Blocks.STONE && getBlock(x, y + 1, z) === Blocks.WATER) {
                    blockData[section][index] = Blocks.getBlockId(Blocks.SAND);
                    continue;
                }
                if (block === Blocks.STONE && getBlock(x, y + 1, z) === Blocks.AIR) {
                    // blockData[section][index] = Blocks.getBlockId(Blocks.GRASS);
                    setBlock(x, y, z, Blocks.GRASS);
                    if (getBlock(x, y - 1, z) === Blocks.STONE)
                        setBlock(x, y - 1, z, Blocks.DIRT);
                    if (getBlock(x, y - 2, z) === Blocks.STONE)
                        setBlock(x, y - 2, z, Blocks.DIRT);
                    if (getBlock(x, y - 3, z) === Blocks.STONE)
                        setBlock(x, y - 3, z, Blocks.DIRT);
                    continue;
                }
                if (block === Blocks.WATER) {
                    isTreeGoodHere = false;
                }
                if (block === Blocks.AIR) {
                    continue;
                }
                if (isTreeGoodHere) {
                    var feature = buildFeatureVariant(OakTreeFeature.variants[0]);
                    this.placeFeature({ x: x, y: y, z: z }, feature, function (pos, block) {
                        var ss = Math.floor(pos.y / 16);
                        var ind = xyzTupelToIndex(pos.x, pos.y % 16, pos.z, CHUNK_WIDTH, CHUNK_WIDTH);
                        blockData[ss][ind] = Blocks.getBlockId(block);
                    });
                    break;
                }
            }
        }
        return blockData;
    };
    ChunkGenerator.prototype.placeFeature = function (position, _a, setBlock) {
        var featureBlocks = _a.blocks, depth = _a.depth, height = _a.height, width = _a.width;
        // const { x, y, z } = position;
        for (var i = 0; i < featureBlocks.length; i += 1) {
            var block = featureBlocks[i];
            if (block === undefined) {
                continue;
            }
            var blockPos = indexToXZY(i, width, depth);
            var pos = sumBlockPos(position, { x: -Math.floor(width / 2), y: 0, z: -Math.floor(depth / 2) }, blockPos);
            if (isBlockPosIn(pos, { x: 0, y: 0, z: 0 }, { x: CHUNK_WIDTH - 1, y: CHUNK_HEIGHT * 8 - 1, z: CHUNK_WIDTH - 1 })) {
                setBlock(pos, block);
            }
        }
    };
    return ChunkGenerator;
}());
export { ChunkGenerator };
expose(ChunkGenerator);
