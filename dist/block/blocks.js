var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { MeshStandardMaterial } from "three";
import { removeDuplicates } from "../util/remove-duplicates";
import { AirBlock } from "./air-block";
import { getBlockModelTextures } from "./block-model/block-model";
import { CauldronBlock } from "./cauldron-block";
import { DirtBlock } from "./dirt-block";
import { GrassBlock } from "./grass-block";
import { SandBlock } from "./sand-block";
import { StoneBlock } from "./stone-block";
import { TextureAtlas } from "./texture-atlas";
var Blocks = /** @class */ (function () {
    function Blocks() {
        this.solidMaterial = new MeshStandardMaterial({ opacity: 1, transparent: false });
        this.waterMaterial = new MeshStandardMaterial({ opacity: 0.8, transparent: true });
        this.transparentMaterial = new MeshStandardMaterial({ alphaTest: 0.5 });
        var blockTextures = Blocks.blocks.flatMap(function (block) { return block.blockModels.flatMap(function (blockModel) { return getBlockModelTextures(blockModel); }); });
        this.blockTextureSources = removeDuplicates(blockTextures);
        this.textureAtlas = new TextureAtlas(this.blockTextureSources);
    }
    Blocks.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var atlas;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.textureAtlas.buildAtlas()];
                    case 1:
                        atlas = _a.sent();
                        this.solidMaterial.map = atlas;
                        this.transparentMaterial.map = atlas;
                        this.waterMaterial.map = atlas;
                        return [2 /*return*/];
                }
            });
        });
    };
    Blocks.getBlockId = function (block) {
        return Blocks.blocks.indexOf(block);
    };
    Blocks.getBlockById = function (id) {
        return Blocks.blocks[id];
    };
    Blocks.prototype.getBlockMaterials = function () {
        return {
            solid: this.solidMaterial,
            transparent: this.transparentMaterial,
            water: this.waterMaterial,
        };
    };
    Blocks.prototype.getBlockTexture = function (texture) {
        return this.textureAtlas.getTextureUv(texture);
    };
    Blocks.prototype.serializeBlockModels = function () {
        var _this = this;
        return {
            textureUvs: this.blockTextureSources.reduce(function (uvs, source) {
                var _a;
                return (__assign(__assign({}, uvs), (_a = {}, _a[source] = _this.textureAtlas.getTextureUv(source), _a)));
            }, {}),
            blockModels: Blocks.blocks.map(function (block) { return block.blockModels; }),
        };
    };
    Blocks.prototype.getNumberOfBlocks = function () {
        return Blocks.blocks.length;
    };
    Blocks.AIR = new AirBlock();
    Blocks.STONE = new StoneBlock();
    Blocks.GRASS = new GrassBlock();
    Blocks.DIRT = new DirtBlock();
    Blocks.SAND = new SandBlock();
    Blocks.CAULDRON = new CauldronBlock();
    Blocks.blocks = [
        Blocks.AIR,
        Blocks.STONE,
        Blocks.GRASS,
        Blocks.DIRT,
        Blocks.SAND,
        Blocks.CAULDRON,
    ];
    return Blocks;
}());
export { Blocks };
