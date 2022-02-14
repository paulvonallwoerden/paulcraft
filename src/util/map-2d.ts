import { Vector2 } from "three";
import { xzTupelToIndex } from "./index-to-vector2";

export type SerializedMap2D<T> = { type: string, spec: unknown };

export interface Map2D<T> {
    sideLength: number;
    get(x: number, y: number): T;
    getV(position: Vector2): T;
    serialize(): SerializedMap2D<T>;
}

export class ArrayMap2D<T> implements Map2D<T> {
    public constructor(
        private readonly data: T[],
        public readonly sideLength: number,
    ) {}

    public get(x: number, y: number): T {
        return this.data[xzTupelToIndex(x, y, this.sideLength)];
    }

    public getV({ x, y }: Vector2): T {
        return this.data[xzTupelToIndex(x, y, this.sideLength)];
    }

    public serialize(): SerializedMap2D<T> {
        return {
            type: 'arraymap2d',
            spec: {
                data: this.data,
                sideLength: this.sideLength,
            },
        };
    }
}

export class PaletteMap2D<T> implements Map2D<T> {
    public constructor(
        private readonly palette: T[],
        private readonly lookup: number[],
        public readonly sideLength: number,
    ) {}

    public get(x: number, y: number): T {
        return this.palette[this.lookup[xzTupelToIndex(x, y, this.sideLength)]];
    }

    public getV({ x, y }: Vector2): T {
        return this.get(x, y);
    }

    public static fromArray<T>(data: T[], sideLength: number): PaletteMap2D<T> {
        const palette: T[] = [];
        const lookup: number[] = data.map((value) => {
            const existingPaletteEntryIndex = palette.findIndex((item) => value === item);
            if (existingPaletteEntryIndex >= 0) {
                return existingPaletteEntryIndex;
            }

            return palette.push(value) - 1;
        });

        return new PaletteMap2D<T>(palette, lookup, sideLength);
    }

    public serialize(): SerializedMap2D<T> {
        return {
            type: 'palettemap2d',
            spec: {
                palette: this.palette,
                lookup: this.lookup,
                sideLength: this.sideLength,
            },
        };
    }
}

export function deserializeMap2D<T>({ type, spec }: SerializedMap2D<T>): Map2D<T> {
    switch (type) {
        case 'arraymap2d':
            return new ArrayMap2D((spec as any).data, (spec as any).sideLength);
        case 'palettemap2d':
            return new PaletteMap2D((spec as any).palette, (spec as any).lookup, (spec as any).sideLength);
        default:
            throw new Error('Unknown map2d type ' + type);
    }
}
