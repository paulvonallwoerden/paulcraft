import { expose } from 'comlink';
import SimplexNoise from 'simplex-noise';
import { Vector2 } from 'three';
import { lerp } from 'three/src/math/MathUtils';
import { AIR_BLOCK_ID, STONE_BLOCK_ID } from '../../block/block-ids';
import { SmoothNoise } from '../../noise/smooth-noise';
import { indexToXZ } from '../../util/index-to-vector2';
import { xyzTupelToIndex } from '../../util/index-to-vector3';
import { deserializeMap2D } from '../../util/map-2d';
import { mod } from '../../util/mod';
import { BiomeGenerator } from '../biome/biome-generator';
import { BiomeMapGenerator } from '../biome/biome-map-generator';
import { WorldNoise } from '../world-noise';
import { CHUNK_HEIGHT, CHUNK_WIDTH } from './chunk-constants';
var ChunkGenerator = /** @class */ (function () {
    function ChunkGenerator(noiseSeed) {
        this.noiseSeed = noiseSeed;
        var smoothNoise = new SmoothNoise(new SimplexNoise(noiseSeed));
        this.biomeMapGenerator = new BiomeMapGenerator(smoothNoise);
        this.biomeGenerator = new BiomeGenerator(smoothNoise);
        this.worldNoise = new WorldNoise(noiseSeed);
    }
    ChunkGenerator.prototype.buildBaseTerrain = function (chunkPosition, heightMap) {
        var heights = deserializeMap2D(heightMap);
        var blockData = new Uint8Array(CHUNK_WIDTH * CHUNK_HEIGHT * CHUNK_WIDTH);
        for (var i = 0; i < CHUNK_WIDTH * CHUNK_WIDTH; i += 1) {
            var _a = indexToXZ(i, CHUNK_WIDTH).toArray(), x = _a[0], z = _a[1];
            var height = heights.get(x, z);
            var ocean = height < 64;
            for (var y = 0; y < Math.max(height, 64); y++) {
                var chunkRow = Math.floor(y / 16);
                if (chunkRow === chunkPosition[1]) {
                    var worldX = chunkPosition[0] * CHUNK_WIDTH + x;
                    var worldY = chunkPosition[1] * CHUNK_HEIGHT + y;
                    var worldZ = chunkPosition[2] * CHUNK_WIDTH + z;
                    var block = this.sampleBlock([worldX, worldY, worldZ], height);
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
    };
    ChunkGenerator.prototype.sampleBlock = function (worldPosition, height) {
        var factor3D = this.worldNoise.sample3DFactor(worldPosition[0], worldPosition[2]);
        var noise3D = this.worldNoise.sample3D(worldPosition[0], worldPosition[1], worldPosition[2]);
        var factor = lerp(worldPosition[1] < height ? 1 : -1, noise3D, factor3D);
        return factor > 0 ? STONE_BLOCK_ID : AIR_BLOCK_ID;
    };
    ChunkGenerator.prototype.generateBiomeMap = function (chunkPosition) {
        var biomes = [];
        for (var i = 0; i < CHUNK_WIDTH * CHUNK_WIDTH; i += 1) {
            var position = indexToXZ(i, CHUNK_WIDTH);
            biomes[i] = this.biomeMapGenerator.sampleBiomeAt(new Vector2(position.x + chunkPosition.x * CHUNK_WIDTH, position.y + chunkPosition.y * CHUNK_WIDTH));
        }
        return biomes;
    };
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
