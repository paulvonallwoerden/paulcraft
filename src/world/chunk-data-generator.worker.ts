import SimplexNoise from "simplex-noise";
import { NumberKeyframeTrack, Vector3 } from "three";
import { xyzTupelToIndex } from "../util/index-to-vector3";
import { ChunkRenderer } from "./chunk-renderer";
import bezierEasing from 'bezier-easing';
import { OakTreeFeature } from "./feature/oak-tree-feature";
import { WorldFeatureBuilder } from "./feature/world-feature";

const CHUNK_WIDTH = 16;
const CHUNK_HEIGHT = 16;

const LandToSeaEasing = bezierEasing(

    .02, .88, .63, 1

);

const CliffnessEasing = bezierEasing(


    1, -0.34, .86, .78


);

function generateChunkData(
    position: Vector3,
    simplexNoise: SimplexNoise,
): Uint8Array {
    const noise2 = (x: number, z: number) => (simplexNoise.noise2D(x, z) + 1) / 2;
    const noise3 = (x: number, y: number, z: number) => (simplexNoise.noise3D(x, y, z) + 1) / 2;

    const blockData = new Uint8Array(CHUNK_WIDTH * CHUNK_HEIGHT * CHUNK_WIDTH);
    for (let x = 0; x < CHUNK_WIDTH; x++) {
        for (let z = 0; z < CHUNK_WIDTH; z++) {
            const worldX = x + position.x * CHUNK_WIDTH;
            const worldZ = z + position.z * CHUNK_WIDTH;

            let landmassNoise = noise2(worldX * 0.0005, worldZ * 0.0005) * 0.95 + noise2(worldX * 0.005, worldZ * 0.005) * 0.05;
            landmassNoise = landmassNoise * 0.9 + noise2(worldX * 0.01, worldZ * 0.01) * 0.1;
            landmassNoise = landmassNoise * 0.97 + noise2(worldX * 0.05, worldZ * 0.05) * 0.03;

            // 0 - 0.4 = Water
            // landmassNoise / 0.4

            const isLandmass = landmassNoise > 0.4;
            if (!isLandmass) {
                if (position.y === 0) {
                    blockData[xyzTupelToIndex(x, 0, z, CHUNK_WIDTH, CHUNK_WIDTH)] = 4;
                }

                continue;
            }

            const beachNoise = noise2(worldX * 0.003, worldZ * 0.003);
            const isBeach = beachNoise < 0.5;
            const cliffness = Math.max(CliffnessEasing(beachNoise), 0);
            const isCliff = cliffness > 0.5;

            const waterNearness = LandToSeaEasing((landmassNoise - 0.4) / 0.6);
            const landToSeaBlend = (1 - cliffness) * waterNearness + cliffness * 2;
            const isNearWater = waterNearness < 0.25;

            const baseHeight = (4 + noise2(worldX * 0.01, worldZ * 0.01) * 32);
            const height = (baseHeight + (noise2(worldX * 0.05, worldZ * 0.05) - 0.5) * 8 + (noise2(worldX * 0.005, worldZ * 0.005) - 0.5) * 16) * landToSeaBlend;
            for (let y = 0; y < CHUNK_HEIGHT; y++) {
                const worldY = y + position.y * CHUNK_HEIGHT;
                const index = xyzTupelToIndex(x, y, z, CHUNK_WIDTH, CHUNK_WIDTH);
                if (height <= 0) {
                    blockData[index] = worldY === 0 ? 4 : 0;

                    continue;
                }

                if (isNearWater && isBeach) {
                    blockData[index] = worldY <= height ? 5 : 0;
                } else if (waterNearness < 0.3 && isCliff) {
                    if (worldY === 0) {
                        blockData[index] = 4;
                        continue;
                    }

                    const cliffFragmentationNoiseAmplitude = 0.07;
                    const cliffFragmentationNoise = noise3(worldX * cliffFragmentationNoiseAmplitude, worldY * cliffFragmentationNoiseAmplitude, worldZ * cliffFragmentationNoiseAmplitude);

                    blockData[index] = (worldY <= height) && (cliffFragmentationNoise > 0.25) ? 1 : 0;
                } else {
                    blockData[index] = worldY > height ? 0 : (worldY > height - 3 ? (worldY > height - 1 ? 2 : 3) : 1);
                }
            }
        }
    }

    return blockData;
}

const ctx: Worker = self as any;

function main() {
    let simplexNoise: SimplexNoise;

    onmessage = ({ data }) => {
        const { type } = data;

        switch (type) {
            case 'seed':
                simplexNoise = new SimplexNoise(data.seed);
                break;
            case 'generate': {
                const result = generateChunkData(
                    new Vector3().fromArray(data.position),
                    simplexNoise,
                );

                ctx.postMessage({ type: 'generate--complete', position: data.position, result });
                break;
            }
            case 'build-mesh': {
                const chunkRenderer = new ChunkRenderer(data.blockTextureUvs);
                const result = chunkRenderer.buildGeometry(data.blockData);

                ctx.postMessage({ type: 'build-mesh--complete', position: data.position, result });
                break;
            }
        }
    }
}

// Beach = '1'
// Cliff = '12'
main();
