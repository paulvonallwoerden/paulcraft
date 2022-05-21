import { expose } from 'comlink';
import SimplexNoise from 'simplex-noise';
import { Vector2 } from 'three';
import { lerp } from 'three/src/math/MathUtils';
import { Blocks } from '../../block/blocks';
import { SmoothNoise } from '../../noise/smooth-noise';
import { indexToXZ } from '../../util/index-to-vector2';
import { xyzTupelToIndex } from '../../util/index-to-vector3';
import { mod } from '../../util/mod';
import { BiomeGenerator } from '../biome/biome-generator';
import { BiomeMapGenerator } from '../biome/biome-map-generator';
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
    ChunkGenerator.prototype.buildTerrain = function (chunkPosition, heightMap) {
        var blocks = this.buildBaseTerrain(chunkPosition);
        // const decoratedBlocks = this.decorateTerrain(blocks);
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
                    blockData[xyzTupelToIndex(x, mod(y, 16), z, CHUNK_WIDTH, CHUNK_WIDTH)] = Blocks.AIR;
                    continue;
                }
                var isBlockAbove = this.sampleIsBlock([worldX, worldY + 1, worldZ], erosion, factor3D);
                blockData[xyzTupelToIndex(x, mod(y, 16), z, CHUNK_WIDTH, CHUNK_WIDTH)] = isBlockAbove ? Blocks.STONE : Blocks.GRASS;
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
    // TODO: Remove this. It is unused. Biomes should be declared after the terrain is generated. Biomes should not be
    // a template for generating terrain. This will result in a more diverse world where biomes aren't bound to specific
    // terrain types.
    ChunkGenerator.prototype.generateBiomeMap = function (chunkPosition) {
        var biomes = [];
        for (var i = 0; i < CHUNK_WIDTH * CHUNK_WIDTH; i += 1) {
            var position = indexToXZ(i, CHUNK_WIDTH);
            biomes[i] = this.biomeMapGenerator.sampleBiomeAt(new Vector2(position.x + chunkPosition.x * CHUNK_WIDTH, position.y + chunkPosition.y * CHUNK_WIDTH));
        }
        return biomes;
    };
    // TODO: Remove this. It is unused.
    ChunkGenerator.prototype.generateHeightMap = function (chunkPosition) {
        var height = [];
        for (var i = 0; i < CHUNK_WIDTH * CHUNK_WIDTH; i += 1) {
            var position = indexToXZ(i, CHUNK_WIDTH);
            var x = position.x + chunkPosition[0] * CHUNK_WIDTH;
            var z = position.y + chunkPosition[1] * CHUNK_WIDTH;
            height[i] = this.worldNoise.sampleErosion(x, z);
        }
        return height;
    };
    return ChunkGenerator;
}());
export { ChunkGenerator };
expose(ChunkGenerator);
