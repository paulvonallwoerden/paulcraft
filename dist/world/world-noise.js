import SimplexNoise from "simplex-noise";
import { CurveInterpolator } from 'curve-interpolator';
import { clamp } from "../util/clamp";
import bezierEasing from "bezier-easing";
import { lerp } from "three/src/math/MathUtils";
var WorldNoise = /** @class */ (function () {
    function WorldNoise(seed) {
        this.continentalnessCurveInterpolator = new CurveInterpolator([
            [0, 30],
            [0.5, 40],
            [1, 64],
            [1.001, 80],
            [1.24, 90],
            [2, 90],
        ], { tension: 1, arcDivisions: 0 });
        this.erosionEasing = bezierEasing(.41, .04, .61, 1);
        this.simplexNoise = new SimplexNoise(seed);
    }
    WorldNoise.prototype.sampleContinentalness = function (x, y) {
        var noiseValue = this.sampleNoise2D(x - 1000, y + 1000, {
            octaves: 4,
            octavePower: 4,
            amplitude: 2,
            frequency: 0.0001523,
        });
        var vector = this.continentalnessCurveInterpolator.getPointAt(noiseValue * 0.5 + 0.5);
        return Math.round(vector[1]);
    };
    WorldNoise.prototype.sampleErosion = function (x, y) {
        var noiseValue = this.sampleNoise2D(x, y, {
            octaves: 5,
            octavePower: 3,
            amplitude: 2,
            frequency: 0.001523,
        });
        var vector = this.erosionEasing(noiseValue);
        return Math.round(vector * 64 + 63) - 1;
    };
    WorldNoise.prototype.sample3DFactor = function (x, y) {
        return this.sampleNoise2D(x, y, {
            octaves: 3,
            octavePower: 2,
            amplitude: 1,
            frequency: 0.003523,
        });
    };
    WorldNoise.prototype.sample3D = function (x, y, z) {
        var value = this.simplexNoise.noise3D(x * 0.01, y * 0.01, z * 0.01);
        return lerp(1, -1, (clamp(value, -1, 1) + 1) / 2);
    };
    WorldNoise.prototype.sampleNoise2D = function (x, y, options) {
        var _a, _b, _c, _d;
        var amplitude = (_a = options === null || options === void 0 ? void 0 : options.amplitude) !== null && _a !== void 0 ? _a : 1;
        var frequency = (_b = options === null || options === void 0 ? void 0 : options.frequency) !== null && _b !== void 0 ? _b : 1;
        var octaves = (_c = options === null || options === void 0 ? void 0 : options.octaves) !== null && _c !== void 0 ? _c : 1;
        var octavePower = (_d = options === null || options === void 0 ? void 0 : options.octavePower) !== null && _d !== void 0 ? _d : 2;
        var value = 0;
        for (var i = 0; i < octaves; i++) {
            var octave = Math.pow(i + 1, octavePower);
            value += (this.simplexNoise.noise2D(x * frequency * octave, y * frequency * octave) * amplitude) / octave;
        }
        return clamp(value, -1, 1);
    };
    return WorldNoise;
}());
export { WorldNoise };
