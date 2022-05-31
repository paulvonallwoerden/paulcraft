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
import { NearestFilter, OrthographicCamera, Scene, TextureLoader, Vector2 } from 'three';
import { makeTextMaterial } from '../shader/text-shader';
import { FontRenderer } from './font-renderer';
var UiManager = /** @class */ (function () {
    function UiManager() {
        this.fontRenderer = new FontRenderer();
        this.textMaterial = makeTextMaterial();
        this.scene = new Scene();
        this.camera = new OrthographicCamera(-10, 10, 10, -10, 0, 1);
        this.size = new Vector2();
        this.activeInterfaces = [];
    }
    UiManager.prototype.setScreenSize = function (width, height) {
        var scale = 0.05;
        this.camera.bottom = 0;
        this.camera.left = 0;
        this.camera.right = width * scale;
        this.camera.top = height * scale;
        this.camera.updateProjectionMatrix();
        this.size.set(width * scale, height * scale);
    };
    UiManager.prototype.show = function (uiInterface) {
        this.activeInterfaces.push(uiInterface);
        uiInterface.init(this);
    };
    UiManager.prototype.render = function () {
        var _this = this;
        this.activeInterfaces.forEach(function (ui) { return ui.draw(_this.size); });
        this.activeInterfaces.forEach(function (ui) { return ui.onAfterDraw(_this, new Vector2(640, 480)); });
    };
    UiManager.prototype.addMesh = function (mesh) {
        mesh.frustumCulled = false;
        this.scene.add(mesh);
    };
    UiManager.prototype.load = function () {
        return __awaiter(this, void 0, void 0, function () {
            var fontTexture;
            var _this = this;
            return __generator(this, function (_a) {
                fontTexture = new TextureLoader().load('textures/ascii.png', function (texture) {
                    fontTexture.minFilter = NearestFilter;
                    fontTexture.magFilter = NearestFilter;
                    _this.fontRenderer.calculateGlyphWidths(texture);
                    _this.textMaterial.uniforms.uTexture.value = fontTexture;
                });
                return [2 /*return*/];
            });
        });
    };
    return UiManager;
}());
export { UiManager };
