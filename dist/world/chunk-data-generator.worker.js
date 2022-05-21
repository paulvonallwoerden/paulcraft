import SimplexNoise from "simplex-noise";
import { Vector3 } from "three";
import { xyzTupelToIndex } from "../util/index-to-vector3";
import bezierEasing from 'bezier-easing';
var CHUNK_WIDTH = 16;
var CHUNK_HEIGHT = 16;
var LandToSeaEasing = bezierEasing(0.02, 0.88, 0.63, 1);
var CliffnessEasing = bezierEasing(1, -0.34, 0.86, 0.78);
function generateChunkData(position, simplexNoise) {
    var noise2 = function (x, z) { return (simplexNoise.noise2D(x, z) + 1) / 2; };
    var noise3 = function (x, y, z) { return (simplexNoise.noise3D(x, y, z) + 1) / 2; };
    var blockData = new Uint8Array(CHUNK_WIDTH * CHUNK_HEIGHT * CHUNK_WIDTH);
    for (var x = 0; x < CHUNK_WIDTH; x++) {
        for (var z = 0; z < CHUNK_WIDTH; z++) {
            var worldX = x + position.x * CHUNK_WIDTH;
            var worldZ = z + position.z * CHUNK_WIDTH;
            var landmassNoise = noise2(worldX * 0.0005, worldZ * 0.0005) * 0.95 + noise2(worldX * 0.005, worldZ * 0.005) * 0.05;
            landmassNoise = landmassNoise * 0.9 + noise2(worldX * 0.01, worldZ * 0.01) * 0.1;
            landmassNoise = landmassNoise * 0.97 + noise2(worldX * 0.05, worldZ * 0.05) * 0.03;
            var isLandmass = landmassNoise > 0.4;
            if (!isLandmass) {
                if (position.y === 0) {
                    blockData[xyzTupelToIndex(x, 0, z, CHUNK_WIDTH, CHUNK_WIDTH)] = 4;
                }
                continue;
            }
            var beachNoise = noise2(worldX * 0.003, worldZ * 0.003);
            var isBeach = beachNoise < 0.5;
            var cliffness = Math.max(CliffnessEasing(beachNoise), 0);
            var isCliff = cliffness > 0.5;
            var waterNearness = LandToSeaEasing((landmassNoise - 0.4) / 0.6);
            var landToSeaBlend = (1 - cliffness) * waterNearness + cliffness * 2;
            var isNearWater = waterNearness < 0.25;
            var baseHeight = (4 + noise2(worldX * 0.01, worldZ * 0.01) * 32);
            var height = (baseHeight + (noise2(worldX * 0.05, worldZ * 0.05) - 0.5) * 8 + (noise2(worldX * 0.005, worldZ * 0.005) - 0.5) * 16) * landToSeaBlend;
            for (var y = 0; y < CHUNK_HEIGHT; y++) {
                var worldY = y + position.y * CHUNK_HEIGHT;
                var index = xyzTupelToIndex(x, y, z, CHUNK_WIDTH, CHUNK_WIDTH);
                if (height <= 0) {
                    blockData[index] = worldY === 0 ? 4 : 0;
                    continue;
                }
                if (isNearWater && isBeach) {
                    blockData[index] = worldY <= height ? 5 : 0;
                }
                else if (waterNearness < 0.3 && isCliff) {
                    if (worldY === 0) {
                        blockData[index] = 4;
                        continue;
                    }
                    var cliffFragmentationNoiseAmplitude = 0.07;
                    var cliffFragmentationNoise = noise3(worldX * cliffFragmentationNoiseAmplitude, worldY * cliffFragmentationNoiseAmplitude, worldZ * cliffFragmentationNoiseAmplitude);
                    blockData[index] = (worldY <= height) && (cliffFragmentationNoise > 0.25) ? 1 : 0;
                }
                else {
                    blockData[index] = worldY > height ? 0 : (worldY > height - 3 ? (worldY > height - 1 ? 2 : 3) : 1);
                }
            }
        }
    }
    return blockData;
}
var ctx = self;
function main() {
    var simplexNoise;
    onmessage = function (_a) {
        var data = _a.data;
        var type = data.type;
        switch (type) {
            case 'seed':
                simplexNoise = new SimplexNoise(data.seed);
                break;
            case 'generate': {
                var result = generateChunkData(new Vector3().fromArray(data.position), simplexNoise);
                ctx.postMessage({ type: 'generate--complete', position: data.position, result: result });
                break;
            }
        }
    };
}
main();
