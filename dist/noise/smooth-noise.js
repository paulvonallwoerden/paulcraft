var SmoothNoise = /** @class */ (function () {
    function SmoothNoise(simplexNoise) {
        this.simplexNoise = simplexNoise;
    }
    SmoothNoise.prototype.sample2DV = function (pos, oscillation, amplitude) {
        if (amplitude === void 0) { amplitude = 1; }
        return this.sample2D(pos.x, pos.y, oscillation, amplitude);
    };
    SmoothNoise.prototype.sample2D = function (x, y, oscillation, amplitude) {
        if (amplitude === void 0) { amplitude = 1; }
        return this.lerpNoiseValueTo01(this.simplexNoise.noise2D(x * oscillation, y * oscillation) * amplitude);
    };
    SmoothNoise.prototype.lerpNoiseValueTo01 = function (value) {
        return (value + 1) / 2;
    };
    return SmoothNoise;
}());
export { SmoothNoise };
