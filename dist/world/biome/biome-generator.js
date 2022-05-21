import { BiomeValues } from "./biome";
var BiomeGenerator = /** @class */ (function () {
    function BiomeGenerator(smoothNoise) {
        this.smoothNoise = smoothNoise;
    }
    BiomeGenerator.prototype.sampleHeightAt = function (biome, pos) {
        var _this = this;
        var _a = BiomeValues[biome].heightMap, base = _a.base, noise = _a.noise;
        return Math.floor(noise.reduce(function (result, _a) {
            var amplitude = _a.amplitude, oscillation = _a.oscillation;
            return result + _this.smoothNoise.sample2DV(pos, oscillation, amplitude);
        }, base));
    };
    return BiomeGenerator;
}());
export { BiomeGenerator };
