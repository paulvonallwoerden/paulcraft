import SimplexNoise from "simplex-noise";
import { CurveInterpolator } from 'curve-interpolator';
import { clamp } from "../util/clamp";
import bezierEasing from "bezier-easing";
import { lerp } from "three/src/math/MathUtils";

export class WorldNoise {
    private simplexNoise: SimplexNoise;
    private continentalnessCurveInterpolator = new CurveInterpolator([
        [0, 30],
        [0.5, 40],
        [1, 64],
        [1.001, 80],
        [1.24, 90],
        [2, 90],
    ], { tension: 1, arcDivisions: 0 });

    private erosionEasing = bezierEasing(.41, .04, .61, 1);

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
            octaves: 4,
            octavePower: 2,
            amplitude: 2,
            frequency: 0.001523,
            noClamp: true,
        });
        // const vector = this.erosionEasing(noiseValue);

        return (noiseValue + 1) / 2; // Math.round(noiseValue * 48 + 64);
    }

    public sample3DFactor(x: number, y: number) {
        return this.sampleNoise2D(x, y, {
            octaves: 3,
            octavePower: 2,
            amplitude: 1,
            frequency: 0.003523,
        });
    }

    public sample3D(x: number, y: number, z: number) {
        const value = this.simplexNoise.noise3D(x * 0.02, y * 0.02, z * 0.02);

        return lerp(1, -1, (clamp(value, -1, 1) + 1) / 2);
    }

    private sampleNoise2D(x: number, y: number, options?: { octaves?: number, octavePower?: number, amplitude?: number, frequency?: number, noClamp?: boolean }): number {
        const amplitude = options?.amplitude ?? 1;
        const frequency = options?.frequency ?? 1;
        const octaves = options?.octaves ?? 1;
        const octavePower = options?.octavePower ?? 2;

        let value = 0;
        for (let i = 0; i < octaves; i++) {
            const octave = Math.pow(i + 1, octavePower);
            value += (this.simplexNoise.noise2D(x * frequency * octave, y * frequency * octave) * amplitude) / octave;
        }

        if (options?.noClamp) {
            return value;
        }

        return clamp(value, -1, 1);
    }
}
