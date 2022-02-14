import { Vector2 } from "three";
import { SmoothNoise } from "../../noise/smooth-noise";
import { Biome, BiomeValues } from "./biome";

export class BiomeGenerator {
    public constructor(private readonly smoothNoise: SmoothNoise) {}

    public sampleHeightAt(biome: Biome, pos: Vector2): number {
        const { base, noise } = BiomeValues[biome].heightMap;

        return Math.floor(noise.reduce(
            (result, { amplitude, oscillation }) => result + this.smoothNoise.sample2DV(
                pos,
                oscillation,
                amplitude,
            ),
            base,
        ));
    }
}
