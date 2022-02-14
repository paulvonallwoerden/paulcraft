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
