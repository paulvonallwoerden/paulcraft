import { expose } from 'comlink';
import { boolean, number } from 'fp-ts';
import SimplexNoise from 'simplex-noise';
import { Vector2 } from 'three';
import { SmoothNoise } from '../../noise/smooth-noise';
import { indexToXZ } from '../../util/index-to-vector2';
import { ArrayMap2D, deserializeMap2D, Map2D, PaletteMap2D, SerializedMap2D } from '../../util/map-2d';
import { Biome } from '../biome/biome';
import { BiomeGenerator } from '../biome/biome-generator';
import { BiomeMapGenerator } from '../biome/biome-map-generator';
import { CHUNK_WIDTH } from './chunk-constants';

export class ChunkGenerator {
    private readonly biomeGenerator: BiomeGenerator;
    private readonly biomeMapGenerator: BiomeMapGenerator;

    public constructor(readonly noiseSeed: number) {
        const smoothNoise = new SmoothNoise(new SimplexNoise(noiseSeed));
        this.biomeMapGenerator = new BiomeMapGenerator(smoothNoise);
        this.biomeGenerator = new BiomeGenerator(smoothNoise);
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

    public generateHeightMap(chunkPosition: Vector2, serializedBiomesMap: SerializedMap2D<Biome>): number[] {
        const biomeMap = deserializeMap2D(serializedBiomesMap);
        const height: number[] = [];
        for (let i = 0; i < CHUNK_WIDTH * CHUNK_WIDTH; i += 1) {
            const position = indexToXZ(i, CHUNK_WIDTH);
            // height[i] = this.biomeGenerator.sampleHeightAt(
            //     biomeMap.getV(position),
            //     new Vector2(
            //         position.x + chunkPosition.x * CHUNK_WIDTH,
            //         position.y + chunkPosition.y * CHUNK_WIDTH,
            //     ),
            // );

            const samplePosition = new Vector2(
                position.x + chunkPosition.x * CHUNK_WIDTH,
                position.y + chunkPosition.y * CHUNK_WIDTH,
            );

            height[i] = this.getSmoothedHeightMapSample(position, samplePosition, biomeMap, 1);
        }

        return height;
    }

    private getSmoothedHeightMapSample(localPosition: Vector2, worldPosition: Vector2, biomeMap: Map2D<Biome>, kernelSize: number) {
        let result = 0;
        for (let x = -kernelSize; x <= kernelSize; x++) {
            for (let y = -kernelSize; y <= kernelSize; y++) {
                result += this.biomeGenerator.sampleHeightAt(
                    biomeMap.getV(localPosition),
                    new Vector2(
                        worldPosition.x + x,
                        worldPosition.y + y,
                    ),
                );
            }
        }

        return result / 9;
    }
}

expose(ChunkGenerator);
