import { xzTupelToIndex } from "./index-to-vector2";
var ArrayMap2D = /** @class */ (function () {
    function ArrayMap2D(data, sideLength) {
        this.data = data;
        this.sideLength = sideLength;
    }
    ArrayMap2D.prototype.get = function (x, y) {
        return this.data[xzTupelToIndex(x, y, this.sideLength)];
    };
    ArrayMap2D.prototype.getV = function (_a) {
        var x = _a.x, y = _a.y;
        return this.data[xzTupelToIndex(x, y, this.sideLength)];
    };
    ArrayMap2D.prototype.serialize = function () {
        return {
            type: 'arraymap2d',
            spec: {
                data: this.data,
                sideLength: this.sideLength,
            },
        };
    };
    return ArrayMap2D;
}());
export { ArrayMap2D };
var PaletteMap2D = /** @class */ (function () {
    function PaletteMap2D(palette, lookup, sideLength) {
        this.palette = palette;
        this.lookup = lookup;
        this.sideLength = sideLength;
    }
    PaletteMap2D.prototype.get = function (x, y) {
        return this.palette[this.lookup[xzTupelToIndex(x, y, this.sideLength)]];
    };
    PaletteMap2D.prototype.getV = function (_a) {
        var x = _a.x, y = _a.y;
        return this.get(x, y);
    };
    PaletteMap2D.fromArray = function (data, sideLength) {
        var palette = [];
        var lookup = data.map(function (value) {
            var existingPaletteEntryIndex = palette.findIndex(function (item) { return value === item; });
            if (existingPaletteEntryIndex >= 0) {
                return existingPaletteEntryIndex;
            }
            return palette.push(value) - 1;
        });
        return new PaletteMap2D(palette, lookup, sideLength);
    };
    PaletteMap2D.prototype.serialize = function () {
        return {
            type: 'palettemap2d',
            spec: {
                palette: this.palette,
                lookup: this.lookup,
                sideLength: this.sideLength,
            },
        };
    };
    return PaletteMap2D;
}());
export { PaletteMap2D };
export function deserializeMap2D(_a) {
    var type = _a.type, spec = _a.spec;
    switch (type) {
        case 'arraymap2d':
            return new ArrayMap2D(spec.data, spec.sideLength);
        case 'palettemap2d':
            return new PaletteMap2D(spec.palette, spec.lookup, spec.sideLength);
        default:
            throw new Error('Unknown map2d type ' + type);
    }
}
