import { BufferAttribute, BufferGeometry, Matrix3, Vector2 } from 'three';
import { indexToXZ } from '../util/index-to-vector2';
var MIN_GLYPH_CODE = 0x21;
var MAX_GLYPH_CODE = 0x7E;
var FONT_SHEET_UNIT = 1 / 16;
var GLYPH_SPACING = 0.1;
var GLYPH_SP_WIDTH = 0.5;
var FontRenderer = /** @class */ (function () {
    function FontRenderer() {
        this.glyphWidths = new Map();
    }
    FontRenderer.prototype.render = function (text) {
        var vertices = [];
        var indices = [];
        var uvs = [];
        var currentOffset = 0;
        var glyphIndex = 0;
        var _loop_1 = function (char) {
            var glyph = char.charCodeAt(0);
            if (glyph === 0x20) {
                currentOffset += GLYPH_SP_WIDTH;
                return "continue";
            }
            var glyphWidth = this_1.glyphWidths.get(glyph);
            if (glyphWidth === undefined) {
                throw new Error("No pre-calculated width for glyph '".concat(String.fromCharCode(glyph), "' exists!"));
            }
            vertices.push.apply(vertices, [
                currentOffset + 0, 0, 0,
                currentOffset + glyphWidth / 16, 0, 0,
                currentOffset + glyphWidth / 16, 1, 0,
                currentOffset + 0, 1, 0,
            ]);
            currentOffset += glyphWidth / 16 + GLYPH_SPACING;
            indices.push.apply(indices, [0, 1, 2, 2, 3, 0].map(function (v) { return v + glyphIndex * 4; }));
            glyphIndex++;
            var _a = indexToXZ(glyph, 16), row = _a.x, column = _a.y;
            var uvMatrix = new Matrix3();
            uvMatrix.translate(row, 15 - column);
            uvMatrix.scale(1 / 16, FONT_SHEET_UNIT);
            uvs.push.apply(uvs, [
                new Vector2(0, 0),
                new Vector2(glyphWidth / 16, 0),
                new Vector2(glyphWidth / 16, 1),
                new Vector2(0, 1),
            ].flatMap(function (v) { return v.applyMatrix3(uvMatrix).toArray(); }));
        };
        var this_1 = this;
        for (var _i = 0, text_1 = text; _i < text_1.length; _i++) {
            var char = text_1[_i];
            _loop_1(char);
        }
        var geometry = new BufferGeometry();
        geometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3));
        geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
        geometry.setIndex(indices);
        return { geometry: geometry, width: currentOffset };
    };
    FontRenderer.prototype.calculateGlyphWidths = function (sheet) {
        var image = sheet.image;
        var canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        if (image.width !== image.height) {
            throw new Error('Font sheet must be square!');
        }
        var context = canvas.getContext('2d');
        if (!context) {
            throw new Error('Could not get context');
        }
        context.drawImage(image, 0, 0);
        var data = context.getImageData(0, 0, image.width, image.height).data;
        canvas.remove();
        for (var i = MIN_GLYPH_CODE; i <= MAX_GLYPH_CODE; i++) {
            this.glyphWidths.set(i, this.calculateGlyphWidth(data, image.width, i));
        }
    };
    FontRenderer.prototype.calculateGlyphWidth = function (data, size, glyph) {
        var imgUnit = size / 16;
        var glyphPos = indexToXZ(glyph, 16);
        var y = glyphPos.y * imgUnit;
        var to = glyphPos.x * imgUnit;
        var from = to + imgUnit - 1;
        for (var x = from; x >= to; x -= 1) {
            for (var s = 0; s < imgUnit; s += 1) {
                var alpha = data[(x + (y + s) * size) * 4 + 3];
                if (alpha > 0) {
                    return x - to + 1;
                }
            }
        }
        throw new Error("Could not find glyph width of '".concat(String.fromCharCode(glyph), "'"));
    };
    return FontRenderer;
}());
export { FontRenderer };
