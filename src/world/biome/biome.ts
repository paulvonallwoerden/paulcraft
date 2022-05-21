import { BlockPos } from "../../block/block-pos";
import { World } from "../world";

export type BiomeDecoratorPass = (world: World, pos: BlockPos) => void;

export class BiomeDecorator {
    public constructor(
        private readonly passes: BiomeDecoratorPass[],
    ) {}

    public apply(world: World, pos: BlockPos) {
        this.passes.forEach((pass) => pass(world, pos));
    }
}

export class DesertBiomeDecorator extends BiomeDecorator {
    private static readonly sandHeight = 3;
    private static readonly cactusHeight = 3;

    public constructor() {
        super(
            [
                // DesertBiomeDecorator.replaceSurface,
                // DesertBiomeDecorator.placeCactee,
            ],
        );
    }

    // protected static replaceSurface(world: World, pos: BlockPos): void {
    //     const isSurfaceBlock = world.getBlock({ ...pos, y: pos.y + 1 }) === airBlock.id;
    //     if (!isSurfaceBlock) {
    //         return;
    //     }

    //     for (let i = 0; i < this.sandHeight; i++) {
    //         const curPos: BlockPos = { ...pos, y: pos.y - i };
    //         if (world.getBlock(curPos) === B.id) {
    //             return;
    //         }

    //         world.setBlock(curPos, SandBlock);   
    //     }
    // }

    // protected static placeCactee(world: World, pos: BlockPos): void {
    //     if (world.getBlock(pos) !== SandBlock.id) {
    //         return;
    //     }

    //     for (let i = 1; i <= this.cactusHeight; i++) {
    //         const curPos: BlockPos = { ...pos, y: pos.y + i };
    //         if (world.getBlock(curPos) !== airBlock.id) {
    //             return;
    //         }

    //         world.setBlock(curPos, SandBlock);   
    //     }
    // }
}

export enum Biome {
    Ocean = 'ocean',
    Beach = 'beach',
    Cliffs = 'cliffs',

    Plains = 'plains',
    OakForest = 'oakforest',
    Desert = 'desert',
    Hills = 'hills',
    Tundra = 'tundra',
    Snow = 'snow',
}

export const Biomes = [
    Biome.Plains,
    Biome.OakForest,
    Biome.Desert,
    Biome.Hills,
    Biome.Tundra,
    Biome.Snow,
];

export interface BiomeValue {
    heightMap: {
        base: number;
        blending: number;
        noise: {
            amplitude: number;
            oscillation: number;
        }[];
    };
}

export const BiomeValues: Record<Biome, BiomeValue> = {
    [Biome.Ocean]: {
        heightMap: {
            base: 16,
            blending: 0,
            noise: [
                {
                    amplitude: 16,
                    oscillation: 0.0023,
                },
            ],
        },
    },
    [Biome.Beach]: {
        heightMap: {
            base: 16,
            blending: 0,
            noise: [
                {
                    amplitude: 16,
                    oscillation: 0.0023,
                },
            ],
        },
    },
    [Biome.Cliffs]: {
        heightMap: {
            base: 16,
            blending: 0,
            noise: [
                {
                    amplitude: 16,
                    oscillation: 0.0023,
                },
            ],
        },
    },

    [Biome.Plains]: {
        heightMap: {
            base: 16,
            blending: 0,
            noise: [
                {
                    amplitude: 16,
                    oscillation: 0.0023,
                },
            ],
        },
    },
    [Biome.OakForest]: {
        heightMap: {
            base: 16,
            blending: 0,
            noise: [
                {
                    amplitude: 16,
                    oscillation: 0.0023,
                },
            ],
        },
    },
    [Biome.Desert]: {
        heightMap: {
            base: 8,
            blending: 0,
            noise: [
                {
                    amplitude: 16,
                    oscillation: 0.0023,
                },
            ],
        },
    },
    [Biome.Hills]: {
        heightMap: {
            base: 32,
            blending: 0,
            noise: [
                {
                    amplitude: 16,
                    oscillation: 0.0023,
                },
            ],
        },
    },
    [Biome.Tundra]: {
        heightMap: {
            base: 10,
            blending: 0,
            noise: [
                {
                    amplitude: 16,
                    oscillation: 0.0023,
                },
            ],
        },
    },
    [Biome.Snow]: {
        heightMap: {
            base: 16,
            blending: 0,
            noise: [
                {
                    amplitude: 16,
                    oscillation: 0.0023,
                },
            ],
        },
    },
};
