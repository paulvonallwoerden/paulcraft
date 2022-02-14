import * as t from 'io-ts';

export const ChunkCodec = t.type({
    blocks: t.type({
        palette: t.array(t.type({
            name: t.string,
            props: t.union([t.undefined, t.record(t.string, t.unknown)]),
        })),
        data: t.array(t.Int),
    }),
    biomes: t.type({
        palette: t.record(t.string, t.unknown),
        data: t.array(t.Int),
    }),
    heightMaps: t.type({
        surface: t.array(t.Int),
    }),
    blockStates: t.array(t.unknown),
    entities: t.array(t.unknown),
});

export const ChunkColumnCodec = t.type({
    version: t.literal('v1'),
    status: t.union([t.literal('heightMaps'), t.literal('full')]),
    chunks: t.array(ChunkCodec),
    updatedAt: t.number,
});

export type ChunkCodecType = t.TypeOf<typeof ChunkCodec>;
export type ChunkColumnCodecType = t.TypeOf<typeof ChunkColumnCodec>;
