import { BufferAttribute, BufferGeometry, Matrix3, Texture, Vector2 } from 'three';
import { indexToXZ } from '../util/index-to-vector2';

const MIN_GLYPH_CODE = 0x21;
const MAX_GLYPH_CODE = 0x7E;
const FONT_SHEET_UNIT = 1 / 16;
const GLYPH_SPACING = 0.1;
const GLYPH_SP_WIDTH = 0.5;

export class FontRenderer {
    private readonly glyphWidths: Map<number, number> = new Map();

    public render(text: string) {
        const vertices: number[] = [];
        const indices: number[] = [];
        const uvs: number[] = [];
        let currentOffset = 0;
        let glyphIndex = 0;

        for (const char of text) {
            const glyph = char.charCodeAt(0);
            if (glyph === 0x20) {
                currentOffset += GLYPH_SP_WIDTH;
                continue;
            }
    
            const glyphWidth = this.glyphWidths.get(glyph);
            if (glyphWidth === undefined) {
                throw new Error(`No pre-calculated width for glyph '${String.fromCharCode(glyph)}' exists!`);
            }

            vertices.push(...[
                currentOffset + 0, 0, 0,
                currentOffset + glyphWidth / 16, 0, 0,
                currentOffset + glyphWidth / 16, 1, 0,
                currentOffset + 0, 1, 0,
            ]);
            currentOffset += glyphWidth / 16 + GLYPH_SPACING;
            indices.push(...[0, 1, 2, 2, 3, 0].map((v) => v + glyphIndex * 4));
            glyphIndex++;
            const { x: row, y: column } = indexToXZ(glyph, 16);
            const uvMatrix = new Matrix3();
            uvMatrix.translate(row, 15 - column);
            uvMatrix.scale(1 / 16, FONT_SHEET_UNIT);
    
            uvs.push(...[
                new Vector2(0, 0),
                new Vector2(glyphWidth / 16, 0),
                new Vector2(glyphWidth / 16, 1),
                new Vector2(0, 1),
            ].flatMap((v) => v.applyMatrix3(uvMatrix).toArray()));
        }

        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3));
        geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
        geometry.setIndex(indices);

        return { geometry, width: currentOffset, vertexCount: vertices.length / 3 };
    }

    public calculateGlyphWidths(sheet: Texture): void {
        const image = (sheet.image as HTMLImageElement);
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        if (image.width !== image.height) {
            throw new Error('Font sheet must be square!');
        }

        const context = canvas.getContext('2d');
        if (!context) {
            throw new Error('Could not get context');
        }
        context.drawImage(image, 0, 0);
        const { data } = context.getImageData(0, 0, image.width, image.height);
        canvas.remove();

        for (let i = MIN_GLYPH_CODE; i <= MAX_GLYPH_CODE; i++) {
            this.glyphWidths.set(i, this.calculateGlyphWidth(data, image.width, i));
        }
    }

    private calculateGlyphWidth(data: Uint8ClampedArray, size: number, glyph: number): number {
        const imgUnit = size / 16;
        const glyphPos = indexToXZ(glyph, 16);
        const y = glyphPos.y * imgUnit;
        const to = glyphPos.x * imgUnit;
        const from = to + imgUnit - 1;
        for (let x = from; x >= to; x -= 1) {
            for (let s = 0; s < imgUnit; s += 1) {
                const alpha = data[(x + (y + s) * size) * 4 + 3];
                if (alpha > 0) {
                    return x - to + 1;
                }
            }
        }

        throw new Error(`Could not find glyph width of '${String.fromCharCode(glyph)}'`);
    }
}
