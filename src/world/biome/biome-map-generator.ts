import { Vector2 } from "three";
import { SmoothNoise } from "../../noise/smooth-noise";
import { Biome, Biomes } from "./biome";

/**
 * Rainfall
 * /\
 * |
 * |
 * |
 * |
 * 
 * Temperature
 * -------->
 */
const RAINFALL_TEMPERATURE_BIOME_MAP = [
    [Biome.Snow,    Biome.Snow,    Biome.Hills,        Biome.Hills],
    [Biome.Snow,    Biome.Tundra,    Biome.Hills,      Biome.Desert],
    [Biome.Tundra,  Biome.Plains,       Biome.Plains,    Biome.Desert],
    [Biome.Tundra,  Biome.Plains,         Biome.Desert,       Biome.Desert],
] as const;

export class BiomeMapGenerator {
    public constructor(
        private readonly smoothNoise: SmoothNoise,
    ) {}

    public sampleBiomeAt(pos: Vector2) {
        const rainfall = this.getRainfallAt(pos);
        const temperature = this.getTemperatureAt(pos);
        const sampleVector = new Vector2(1 - rainfall, temperature).clampLength(0, 1);
        const sampleX = Math.round(sampleVector.x * 3);
        const sampleY = Math.round(sampleVector.y * 3);
        const biome = RAINFALL_TEMPERATURE_BIOME_MAP[sampleX][sampleY];

        return biome;
    }

    private getRainfallAt(pos: Vector2) {
        const regionNoise = this.smoothNoise.sample2DV(pos, 0.0005);
        const detailNoise = this.smoothNoise.sample2DV(pos, 0.0066);
        const fractureNoise = this.smoothNoise.sample2DV(pos, 0.025);

        return regionNoise * 0.95 + detailNoise * 0.04 + fractureNoise * 0.01;
    }

    private getTemperatureAt(pos: Vector2) {
        const tempPos = new Vector2(pos.x + 10000, pos.y - 10000);

        const regionNoise = this.smoothNoise.sample2DV(tempPos, 0.0003);
        const detailNoise = this.smoothNoise.sample2DV(tempPos, 0.0056);
        const fractureNoise = this.smoothNoise.sample2DV(tempPos, 0.002);

        return regionNoise * 0.95 + detailNoise * 0.04 + fractureNoise * 0.01;
    }
}
