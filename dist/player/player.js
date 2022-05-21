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
import pMap from "p-map";
import { Audio, AudioLoader, Box3, MathUtils, Raycaster, Vector2, Vector3 } from "three";
import { degToRad } from "three/src/math/MathUtils";
import { Game } from "../game";
import { LeftMouseButton, RightMouseButton } from "../input/input";
import { xyzTupelToIndex } from "../util/index-to-vector3";
import { randomElement } from "../util/random-element";
import { Blocks } from "../block/blocks";
import { WorldCursor } from "./world-cursor";
// TODO: Re-factor to:
// - don't use createTerrainCollisionBoxes as it's stupid.
// - use block-based ray-casting and not mesh-based ray-casting.
// - not be responsible for playing audio.
// - have separated input & physics logic.
// TODO: Support blocks that shouldn't have collision. E.g. flowers.
var Player = /** @class */ (function () {
    function Player(camera, input, position, rotation) {
        this.camera = camera;
        this.input = input;
        this.position = position;
        this.rotation = rotation;
        this.walkingSpeed = 0.025;
        this.flyingSpeed = 0.065;
        this.isOnGround = false;
        this.velocity = new Vector3();
        this.flying = false;
        this.noclip = false;
        this.start = false;
        this.raycaster = new Raycaster();
        this.collisionBox = new Box3(new Vector3(-0.35, 0, -0.35), new Vector3(0.35, 1.8, 0.35));
        this.terrainCollisionBoxes = [];
        this.placeBlockSounds = [];
        this.digBlockSounds = [];
        this.selectedBlockId = Blocks.getBlockId(Blocks.CAULDRON);
        this.worldCursor = new WorldCursor();
        this.audio = new Audio(Game.main.audioListener);
        this.updateMovement(0, 0);
        this.updateCamera(0);
    }
    Player.prototype.getChunkPosition = function () {
        return [
            Math.floor(this.position.x / 16),
            Math.floor(this.position.y / 16),
            Math.floor(this.position.z / 16),
        ];
    };
    Player.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var audioLoader, _a, _b;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        audioLoader = new AudioLoader();
                        _a = this;
                        return [4 /*yield*/, pMap([
                                'audio/dig0.mp3',
                                'audio/dig1.mp3',
                                'audio/dig2.mp3',
                            ], function (src) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                return [2 /*return*/, audioLoader.loadAsync(src)];
                            }); }); })];
                    case 1:
                        _a.digBlockSounds = _c.sent();
                        _b = this;
                        return [4 /*yield*/, pMap([
                                'audio/place0.mp3',
                            ], function (src) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                return [2 /*return*/, audioLoader.loadAsync(src)];
                            }); }); })];
                    case 2:
                        _b.placeBlockSounds = _c.sent();
                        this.audio.setVolume(0.2);
                        this.worldCursor.register(Game.main.scene);
                        return [2 /*return*/];
                }
            });
        });
    };
    Player.prototype.update = function (deltaTime) {
        this.raycaster.setFromCamera({ x: 0, y: 0 }, this.camera);
        var intersections = this.raycaster.intersectObjects(Game.main.level.getChunkMeshes());
        var intersection = intersections.reduce(function (nearestIntersection, intersection) { return nearestIntersection && nearestIntersection.distance < intersection.distance ? nearestIntersection : intersection; }, undefined);
        if (intersection !== undefined && intersection.face) {
            var normalOffset = intersection.face.normal.normalize().multiplyScalar(0.1);
            var hitBlockPos = {
                x: Math.floor(intersection.point.x - normalOffset.x),
                y: Math.floor(intersection.point.y - normalOffset.y),
                z: Math.floor(intersection.point.z - normalOffset.z),
            };
            if (this.input.isKeyDowned(LeftMouseButton)) {
                if (this.audio.isPlaying)
                    this.audio.stop();
                this.audio.setBuffer(randomElement(this.digBlockSounds));
                this.audio.play();
                var world = Game.main.level.getWorld();
                var blockToBreak = world.getBlock(hitBlockPos);
                world.setBlock(hitBlockPos, Blocks.AIR);
                blockToBreak === null || blockToBreak === void 0 ? void 0 : blockToBreak.onBreak(world, hitBlockPos);
            }
            {
                var world = Game.main.level.getWorld();
                this.worldCursor.set(world, hitBlockPos);
                var hitBlock = world.getBlock(hitBlockPos);
                // if (hitBlock) {
                //     const modelIndex = hitBlock.getBlockModel(world.getBlockState(hitBlockPos)!);
                //     const model = hitBlock.blockModels[modelIndex];
                //     const [element] = model.elements;
                //     if (element !== undefined) {
                //         const distance = 0.001;
                //         const [x, y, z] = element.from;
                //         const [width, height, depth] = [
                //             (element.to[0] - x) / 15 + distance * 2,
                //             (element.to[1] - y) / 15 + distance * 2,
                //             (element.to[2] - z) / 15 + distance * 2,
                //         ];
                //         this.worldCursorGeometry = new BoxGeometry(width, height, depth);
                //         this.worldCursorGeometry.translate(
                //             (hitBlockPos.x + width / 2) + x / 15 - distance,
                //             (hitBlockPos.y + height / 2) + y / 15 - distance,
                //             (hitBlockPos.z + depth / 2) + z / 15 - distance,
                //         );
                //         this.worldCursorMaterial = createWorldCursorMaterial(this.worldCursorGeometry);
                //         this.worldCursor.material = this.worldCursorMaterial;
                //         this.worldCursor.geometry = this.worldCursorGeometry;
                //     }
                // }
                if (this.input.isKeyDowned(RightMouseButton)) {
                    var interactionResult = hitBlock === null || hitBlock === void 0 ? void 0 : hitBlock.onInteract(world, hitBlockPos);
                    if (interactionResult === false) {
                        if (this.audio.isPlaying)
                            this.audio.stop();
                        this.audio.setBuffer(randomElement(this.placeBlockSounds));
                        this.audio.play();
                        var samplePoint = intersection.point.clone().add(normalOffset);
                        var _a = [
                            Math.floor(samplePoint.x),
                            Math.floor(samplePoint.y),
                            Math.floor(samplePoint.z),
                        ], hitX = _a[0], hitY = _a[1], hitZ = _a[2];
                        var blockPos = new Vector3(hitX, hitY, hitZ);
                        var blockToPlace = Blocks.getBlockById(this.selectedBlockId);
                        Game.main.level.setBlockAt(blockPos, blockToPlace);
                        blockToPlace.onPlace(world, blockPos);
                    }
                }
            }
        }
        if (this.input.isKeyPressed(' ')) {
            this.start = true;
        }
        if (!this.start)
            return;
        // Inventory
        if (this.input.isKeyDowned('Q') && this.selectedBlockId > 1) {
            this.selectedBlockId--;
        }
        if (this.input.isKeyDowned('E') && this.selectedBlockId + 1 < Game.main.blocks.getNumberOfBlocks()) {
            this.selectedBlockId++;
        }
        // Movement
        var movementSpeed = this.flying ? this.flyingSpeed : this.walkingSpeed;
        {
            var inputVector = new Vector3();
            if (this.input.isKeyPressed('W')) {
                inputVector.setX(-1);
            }
            if (this.input.isKeyPressed('S')) {
                inputVector.setX(1);
            }
            if (this.input.isKeyPressed('D')) {
                inputVector.setZ(1);
            }
            if (this.input.isKeyPressed('A')) {
                inputVector.setZ(-1);
            }
            if (inputVector.length() > 1) {
                inputVector = inputVector.normalize();
            }
            if (this.input.isKeyPressed(' ') && (this.isOnGround || this.flying)) {
                inputVector.setY(0.012);
            }
            if (this.input.isKeyPressed('Shift') && this.flying) {
                inputVector.setY(-0.015);
            }
            // Cheating
            if (this.input.isKeyDowned('F')) {
                this.flying = !this.flying;
            }
            if (this.input.isKeyDowned('N')) {
                this.noclip = !this.noclip;
            }
            var x = Math.cos(this.rotation.y);
            var z = Math.sin(this.rotation.y);
            var forward = new Vector2(x, z).normalize();
            var right = new Vector2(-z, x).normalize();
            this.velocity.multiply(new Vector3(0.9, 1, 0.9));
            this.velocity.add(new Vector3((forward.y * inputVector.x + right.y * inputVector.z) * movementSpeed, inputVector.y, (forward.x * inputVector.x + right.x * inputVector.z) * movementSpeed));
            if (!this.flying) {
                this.velocity.setY(this.velocity.y - 0.00005 * deltaTime);
            }
            else {
                this.velocity.multiply(new Vector3(1, 0.9, 1));
            }
        }
        if (!this.noclip) {
            var potentialPosition = this.position.clone().add(this.velocity.clone().multiplyScalar(deltaTime).multiply(new Vector3(movementSpeed, 1, movementSpeed)));
            var _b = potentialPosition.toArray(), potentialX = _b[0], potentialY = _b[1], potentialZ = _b[2];
            var collisionX = this.createTerrainCollisionBoxes([potentialX, this.position.y, this.position.z]);
            if (collisionX)
                this.velocity.setX(0);
            var collisionY = this.createTerrainCollisionBoxes([this.position.x, potentialY, this.position.z]);
            if (collisionY) {
                if (this.velocity.y < 0) {
                    this.isOnGround = true;
                }
                else {
                    this.isOnGround = false;
                }
                this.velocity.setY(0);
            }
            else {
                this.isOnGround = false;
            }
            var collisionZ = this.createTerrainCollisionBoxes([this.position.x, this.position.y, potentialZ]);
            if (collisionZ)
                this.velocity.setZ(0);
        }
        this.updateMovement(deltaTime, movementSpeed);
        this.updateCamera(deltaTime);
    };
    Player.prototype.createTerrainCollisionBoxes = function (_a) {
        var x = _a[0], y = _a[1], z = _a[2];
        this.collisionBox.set(new Vector3(x - 0.35, y, z - 0.35), new Vector3(x + 0.35, y + 1.8, z + 0.35));
        var world = Game.main.level.getWorld();
        var _b = [Math.floor(x + 0.5), Math.floor(y + 0.5), Math.floor(z + 0.5)], blockX = _b[0], blockY = _b[1], blockZ = _b[2];
        for (var ix = -2; ix < 2; ix += 1) {
            for (var iy = -2; iy < 3; iy += 1) {
                for (var iz = -2; iz < 2; iz += 1) {
                    var boxIndex = xyzTupelToIndex(ix + 2, iy + 2, iz + 2, 5, 5);
                    if (!this.terrainCollisionBoxes[boxIndex]) {
                        this.terrainCollisionBoxes[boxIndex] = new Box3();
                    }
                    var blockPos = new Vector3(blockX + ix, blockY + iy, blockZ + iz);
                    var block = Game.main.level.getBlockAt(blockPos);
                    var solidBlock = block !== undefined && block.isCollidable(world, blockPos);
                    this.terrainCollisionBoxes[boxIndex].set(new Vector3(blockX + ix, blockY + iy, blockZ + iz), new Vector3(blockX + ix + 1, blockY + iy + 1, blockZ + iz + 1));
                    if (!solidBlock) {
                        continue;
                    }
                    var collision = this.terrainCollisionBoxes[boxIndex].intersectsBox(this.collisionBox);
                    if (collision) {
                        return true;
                    }
                }
            }
        }
        return false;
    };
    Player.prototype.updateMovement = function (deltaTime, movementSpeed) {
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime).multiply(new Vector3(movementSpeed, 1, movementSpeed)));
    };
    Player.prototype.updateCamera = function (deltaTime) {
        this.camera.position.set(this.position.x, this.position.y + 1.8, this.position.z);
        this.rotation.x = MathUtils.clamp(this.rotation.x + degToRad(deltaTime * this.input.getMouseDelta()[1] * -0.01), -0.4999 * Math.PI, 0.4999 * Math.PI);
        this.rotation.y += degToRad(deltaTime * this.input.getMouseDelta()[0] * -0.01);
        var phi = this.rotation.x - 0.5 * Math.PI;
        var theta = this.rotation.y;
        var target = new Vector3().setFromSphericalCoords(1, phi, theta).add(this.camera.position);
        this.camera.lookAt(target);
    };
    return Player;
}());
export { Player };
