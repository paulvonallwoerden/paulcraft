import { Blocks } from '../../block/blocks';
export var OakTreeFeature = {
    placeOn: Blocks.GRASS,
    variants: [
        {
            elements: [
                {
                    shape: 'cube',
                    from: [-2, 3, -2],
                    to: [2, 4, 2],
                    block: Blocks.LEAVES,
                },
                {
                    shape: 'cube',
                    from: [-1, 5, -1],
                    to: [1, 5, 1],
                    block: Blocks.LEAVES,
                },
                {
                    shape: 'cube',
                    from: [-1, 6, 0],
                    to: [1, 6, 0],
                    block: Blocks.LEAVES,
                },
                {
                    shape: 'cube',
                    from: [0, 6, -1],
                    to: [0, 6, 1],
                    block: Blocks.LEAVES,
                },
                {
                    shape: 'cube',
                    from: [0, 0, 0],
                    to: [0, 5, 0],
                    block: Blocks.OAK_LOG,
                },
            ],
        },
    ],
};
