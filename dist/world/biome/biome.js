var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var _a;
var BiomeDecorator = /** @class */ (function () {
    function BiomeDecorator(passes) {
        this.passes = passes;
    }
    BiomeDecorator.prototype.apply = function (world, pos) {
        this.passes.forEach(function (pass) { return pass(world, pos); });
    };
    return BiomeDecorator;
}());
export { BiomeDecorator };
var DesertBiomeDecorator = /** @class */ (function (_super) {
    __extends(DesertBiomeDecorator, _super);
    function DesertBiomeDecorator() {
        return _super.call(this, [
        // DesertBiomeDecorator.replaceSurface,
        // DesertBiomeDecorator.placeCactee,
        ]) || this;
    }
    DesertBiomeDecorator.sandHeight = 3;
    DesertBiomeDecorator.cactusHeight = 3;
    return DesertBiomeDecorator;
}(BiomeDecorator));
export { DesertBiomeDecorator };
export var Biome;
(function (Biome) {
    Biome["Ocean"] = "ocean";
    Biome["Beach"] = "beach";
    Biome["Cliffs"] = "cliffs";
    Biome["Plains"] = "plains";
    Biome["OakForest"] = "oakforest";
    Biome["Desert"] = "desert";
    Biome["Hills"] = "hills";
    Biome["Tundra"] = "tundra";
    Biome["Snow"] = "snow";
})(Biome || (Biome = {}));
export var Biomes = [
    Biome.Plains,
    Biome.OakForest,
    Biome.Desert,
    Biome.Hills,
    Biome.Tundra,
    Biome.Snow,
];
export var BiomeValues = (_a = {},
    _a[Biome.Ocean] = {
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
    _a[Biome.Beach] = {
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
    _a[Biome.Cliffs] = {
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
    _a[Biome.Plains] = {
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
    _a[Biome.OakForest] = {
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
    _a[Biome.Desert] = {
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
    _a[Biome.Hills] = {
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
    _a[Biome.Tundra] = {
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
    _a[Biome.Snow] = {
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
    _a);
