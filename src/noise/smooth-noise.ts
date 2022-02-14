import SimplexNoise from "simplex-noise";
import { Vector2 } from "three";

export class SmoothNoise {
    public constructor(private readonly simplexNoise: SimplexNoise) {}

    public sample2DV(pos: Vector2, oscillation: number, amplitude = 1): number {
        return this.sample2D(pos.x, pos.y, oscillation, amplitude);
    }

    public sample2D(x: number, y: number, oscillation: number, amplitude = 1): number {
        return this.lerpNoiseValueTo01(
            this.simplexNoise.noise2D(x * oscillation, y * oscillation) * amplitude,
        );
    }

    private lerpNoiseValueTo01(value: number): number {
        return (value + 1) / 2;
    }
}
