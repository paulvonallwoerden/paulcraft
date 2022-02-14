import SimplexNoise from "simplex-noise";
import { CurveInterpolator } from 'curve-interpolator';
import { clamp } from "../util/clamp";

export class WorldNoise {
    private simplexNoise: SimplexNoise;
    private continentalnessCurveInterpolator = new CurveInterpolator([
        [0, 30],
        [0.5, 40],
        [1, 64],
        [1.05, 68],
        [1.24, 90],
        [2, 90],
    ], { tension: 1, arcDivisions: 1 });
    private erosionCurveInterpolator = new CurveInterpolator([
        [0, 0],
        [0.5, 0],
        [0.8, 20],
        [0.9, 70],
        [1, 74],
    ], { tension: 1, arcDivisions: 1 });

    public constructor(seed: number) {
        this.simplexNoise = new SimplexNoise(seed);
    }

    public sampleContinentalness(x: number, y: number) {
        const noiseValue = this.sampleNoise2D(x - 1000, y + 1000, {
            octaves: 4,
            octavePower: 4,
            amplitude: 2,
            frequency: 0.0001523,
        });
        const vector = this.continentalnessCurveInterpolator.getPointAt(
            noiseValue * 0.5 + 0.5,
        );

        return Math.round(vector[1]);
    }

    public sampleErosion(x: number, y: number) {
        const noiseValue = this.sampleNoise2D(x, y, {
            octaves: 5,
            octavePower: 3,
            amplitude: 2,
            frequency: 0.0004523,
        });
        const vector = this.erosionCurveInterpolator.getPointAt(
            noiseValue * 0.5 + 0.5,
        );

        return Math.round(vector[1]);
    }

    public sample3DFactor() {}

    // public sampleRainfall(pos: Vector2) {
    //     const regionNoise = this.smoothNoise.sample2DV(pos, 0.0005);
    //     const detailNoise = this.smoothNoise.sample2DV(pos, 0.0066);
    //     const fractureNoise = this.smoothNoise.sample2DV(pos, 0.025);

    //     return regionNoise * 0.95 + detailNoise * 0.04 + fractureNoise * 0.01;
    // }

    // public sampleTemperature(pos: Vector2) {
    //     const tempPos = new Vector2(pos.x + 10000, pos.y - 10000);

    //     const regionNoise = this.smoothNoise.sample2DV(tempPos, 0.0003);
    //     const detailNoise = this.smoothNoise.sample2DV(tempPos, 0.0056);
    //     const fractureNoise = this.smoothNoise.sample2DV(tempPos, 0.002);

    //     return regionNoise * 0.95 + detailNoise * 0.04 + fractureNoise * 0.01;
    // }

    private sampleNoise2D(x: number, y: number, options?: { octaves?: number, octavePower?: number, amplitude?: number, frequency?: number }): number {
        const amplitude = options?.amplitude ?? 1;
        const frequency = options?.frequency ?? 1;
        const octaves = options?.octaves ?? 1;
        const octavePower = options?.octavePower ?? 2;

        let value = 0;
        for (let i = 0; i < octaves; i++) {
            const octave = Math.pow(i + 1, octavePower);
            value += (this.simplexNoise.noise2D(x * frequency * octave, y * frequency * octave) * amplitude) / octave;
        }

        return clamp(value, -1, 1);
    }
}
