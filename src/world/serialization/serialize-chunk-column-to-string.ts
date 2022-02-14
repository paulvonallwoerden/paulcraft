import * as t from "io-ts";
import { Game } from "../../game";
import { Chunk } from "../chunk";
import { ChunkColumn } from "../chunk-column";
import { ChunkCodecType, ChunkColumnCodec } from "./region-codec";

// function createPaletteData<T, K>(
//     input: T[],
//     createIdentifier: (thing: T) => string,
//     getPayload: (thing: T) => K = (thing) => thing as unknown as K,
// ): { palette: K[], data: t.Int[] } {
//     const paletteIndexMap: Record<string, t.Int> = {};

//     const palette: K[] = [];
//     const data: t.Int[] = input.map((thing) => {
//         const identifier = createIdentifier(thing);
//         const paletteLookupResult = paletteIndexMap[identifier];
//         if (paletteLookupResult) {
//             return paletteLookupResult;
//         }

//         const palletLength = palette.push(getPayload(thing));
//         const paletteIndex = palletLength - 1 as t.Int;
//         paletteIndexMap[identifier] = paletteIndex;

//         return paletteIndex;
//     });

//     return { data, palette };
// }

// function serializeChunkBiomes(biomes: { name: string }[]): ChunkCodecType['biomes'] {
//     return createPaletteData(
//         biomes,
//         (biome) => biome.name,
//         (biome) => biome,
//     );
// }

// function serializeChunkBlocks(blocks: string[]): ChunkCodecType['blocks'] {
//     return createPaletteData(
//         blocks,
//         // Currently a block is only defined by its name. In the future custom
//         // properties (props) like it's facing direction may be included.
//         (block) => block,
//         (block) => ({ name: block, props: {} }),
//     );
// }

// function serializeChunk(chunk: Chunk): ChunkCodecType {
//     return {
//         blocks: serializeChunkBlocks(chunk.blocks),
//         biomes: { data: [], palette: {} },
//         heightMaps: { surface: [] },
//         blockStates: [],
//         entities: [],
//     }
// }

// export function serializeChunkColumnToString(chunkColumn: ChunkColumn): string {
//     const encoded = ChunkColumnCodec.encode({
//         version: 'v1',
//         updatedAt: Game.main.ticks,
//         status: chunkColumn.getStatus(),
//         chunks: chunkColumn.chunks.map(serializeChunk),
//     });

//     return JSON.stringify(encoded);
// }
