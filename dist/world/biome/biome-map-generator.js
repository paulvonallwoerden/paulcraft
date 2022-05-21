import { Vector2 } from "three";
import { Biome } from "./biome";
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
var RAINFALL_TEMPERATURE_BIOME_MAP = [
    [Biome.Snow, Biome.Snow, Biome.Hills, Biome.Hills],
    [Biome.Snow, Biome.Tundra, Biome.Hills, Biome.Desert],
    [Biome.Tundra, Biome.Plains, Biome.Plains, Biome.Desert],
    [Biome.Tundra, Biome.Plains, Biome.Desert, Biome.Desert],
];
var BiomeMapGenerator = /** @class */ (function () {
    function BiomeMapGenerator(smoothNoise) {
        this.smoothNoise = smoothNoise;
    }
    BiomeMapGenerator.prototype.sampleBiomeAt = function (pos) {
        var rainfall = this.getRainfallAt(pos);
        var temperature = this.getTemperatureAt(pos);
        var sampleVector = new Vector2(1 - rainfall, temperature).clampLength(0, 1);
        var sampleX = Math.round(sampleVector.x * 3);
        var sampleY = Math.round(sampleVector.y * 3);
        var biome = RAINFALL_TEMPERATURE_BIOME_MAP[sampleX][sampleY];
        return biome;
    };
    BiomeMapGenerator.prototype.getRainfallAt = function (pos) {
        var regionNoise = this.smoothNoise.sample2DV(pos, 0.0005);
        var detailNoise = this.smoothNoise.sample2DV(pos, 0.0066);
        var fractureNoise = this.smoothNoise.sample2DV(pos, 0.025);
        return regionNoise * 0.95 + detailNoise * 0.04 + fractureNoise * 0.01;
    };
    BiomeMapGenerator.prototype.getTemperatureAt = function (pos) {
        var tempPos = new Vector2(pos.x + 10000, pos.y - 10000);
        var regionNoise = this.smoothNoise.sample2DV(tempPos, 0.0003);
        var detailNoise = this.smoothNoise.sample2DV(tempPos, 0.0056);
        var fractureNoise = this.smoothNoise.sample2DV(tempPos, 0.002);
        return regionNoise * 0.95 + detailNoise * 0.04 + fractureNoise * 0.01;
    };
    return BiomeMapGenerator;
}());
export { BiomeMapGenerator };
