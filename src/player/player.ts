import pMap from "p-map";
import { Audio, AudioLoader, Box3, Camera, Intersection, MathUtils, Raycaster, Vector2, Vector3, Vector3Tuple } from "three";
import { degToRad } from "three/src/math/MathUtils";
import { Game } from "../game";
import { Input, LeftMouseButton, RightMouseButton } from "../input/input";
import { xyzTupelToIndex } from "../util/index-to-vector3";
import { randomElement } from "../util/random-element";
import { Blocks } from "../block/blocks";

// TODO: Re-factor to:
// - don't use createTerrainCollisionBoxes as it's stupid.
// - use block-based ray-casting and not mesh-based ray-casting.
// - not be responsible for playing audio.
// - have separated input & physics logic.
// TODO: Support blocks that shouldn't have collision. E.g. flowers.
export class Player {
    private readonly walkingSpeed = 0.025;
    private readonly flyingSpeed = 0.065;

    private isOnGround = false;
    private velocity = new Vector3();

    private flying = false;
    private noclip = false;

    private start = false;

    private readonly raycaster: Raycaster = new Raycaster();
    private readonly collisionBox = new Box3(new Vector3(-0.35, 0, -0.35), new Vector3(0.35, 1.8, 0.35));
    private readonly terrainCollisionBoxes: Box3[] = [];

    private placeBlockSounds: AudioBuffer[] = [];
    private digBlockSounds: AudioBuffer[] = [];
    private readonly audio: Audio;

    private selectedBlockId: number = Blocks.getBlockId(Blocks.CAULDRON);

    public constructor(
        private readonly camera: Camera,
        private readonly input: Input,
        private position: Vector3,
        private rotation: Vector2,
    ) {
        this.audio = new Audio(Game.main.audioListener);

        this.updateMovement(0, 0);
        this.updateCamera(0);
    }

    public getChunkPosition(): [number, number, number] {
        return [
            Math.floor(this.position.x / 16),
            Math.floor(this.position.y / 16),
            Math.floor(this.position.z / 16),
        ];
    }

    public async init() {
        const audioLoader = new AudioLoader();
        this.digBlockSounds = await pMap(
            [
                'audio/dig0.mp3',
                'audio/dig1.mp3',
                'audio/dig2.mp3',
            ],
            async (src) => audioLoader.loadAsync(src),
        );
        this.placeBlockSounds = await pMap(
            [
                'audio/place0.mp3',
            ],
            async (src) => audioLoader.loadAsync(src),
        );

        this.audio.setVolume(0.2);
    }

    public update(deltaTime: number) {
        this.raycaster.setFromCamera({ x: 0, y: 0 }, this.camera);
        const intersections = this.raycaster.intersectObjects(Game.main.level.getChunkMeshes());
        const intersection = intersections.reduce<Intersection | undefined>(
            (nearestIntersection, intersection) => nearestIntersection && nearestIntersection.distance < intersection.distance ? nearestIntersection : intersection,
            undefined,
        );
        if (intersection !== undefined && intersection.face) {
            const normalOffset = intersection.face.normal.normalize().multiplyScalar(0.1);
            {
                const samplePoint = intersection.point.clone().sub(normalOffset);
                const [hitX, hitY, hitZ] = [
                    Math.floor(samplePoint.x),
                    Math.floor(samplePoint.y),
                    Math.floor(samplePoint.z),
                ];
                const blockPos = new Vector3(hitX, hitY, hitZ);

                if (this.input.isKeyDowned(LeftMouseButton)) {
                    if (this.audio.isPlaying) this.audio.stop();
                    this.audio.setBuffer(randomElement(this.digBlockSounds));
                    this.audio.play();
                    Game.main.level.setBlockAt(blockPos, Blocks.AIR);
                }
            }

            {
                const samplePoint = intersection.point.clone().add(normalOffset);
                const [hitX, hitY, hitZ] = [
                    Math.floor(samplePoint.x),
                    Math.floor(samplePoint.y),
                    Math.floor(samplePoint.z),
                ];
                const blockPos = new Vector3(hitX, hitY, hitZ);
                if (this.input.isKeyDowned(RightMouseButton)) {
                    if (this.audio.isPlaying) this.audio.stop();
                    this.audio.setBuffer(randomElement(this.placeBlockSounds));
                    this.audio.play();
                    Game.main.level.setBlockAt(blockPos, Blocks.getBlockById(this.selectedBlockId));
                }
            }
        }

        if (this.input.isKeyPressed(' ')) {
            this.start = true;
        }

        if (!this.start) return;

        // Inventory
        if (this.input.isKeyDowned('Q') && this.selectedBlockId > 1) {
            this.selectedBlockId--;
        }
        if (this.input.isKeyDowned('E') && this.selectedBlockId + 1 < Game.main.blocks.getNumberOfBlocks()) {
            this.selectedBlockId++;
        }

        // Movement
        const movementSpeed = this.flying ? this.flyingSpeed : this.walkingSpeed;
        {
            let inputVector = new Vector3();
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

            const x = Math.cos(this.rotation.y);
            const z = Math.sin(this.rotation.y);
            const forward = new Vector2(x, z).normalize();
            const right = new Vector2(-z, x).normalize();

            this.velocity.multiply(new Vector3(0.9, 1, 0.9));
            this.velocity.add(new Vector3(
                (forward.y * inputVector.x + right.y * inputVector.z) * movementSpeed,
                inputVector.y,
                (forward.x * inputVector.x + right.x * inputVector.z) * movementSpeed,
            ));

            if (!this.flying) {
                this.velocity.setY(this.velocity.y - 0.00005 * deltaTime);
            } else {
                this.velocity.multiply(new Vector3(1, 0.9, 1));
            }
        }

        if (!this.noclip) {
            const potentialPosition = this.position.clone().add(this.velocity.clone().multiplyScalar(deltaTime).multiply(new Vector3(movementSpeed, 1, movementSpeed)));
            const [potentialX, potentialY, potentialZ] = potentialPosition.toArray()
            const collisionX = this.createTerrainCollisionBoxes([potentialX, this.position.y, this.position.z]);
            if (collisionX) this.velocity.setX(0);
            const collisionY = this.createTerrainCollisionBoxes([this.position.x, potentialY, this.position.z]);
            if (collisionY) {
                if (this.velocity.y < 0) {
                    this.isOnGround = true;
                } else {
                    this.isOnGround = false;
                }
    
                this.velocity.setY(0);
            } else {
                this.isOnGround = false;
            }
            const collisionZ = this.createTerrainCollisionBoxes([this.position.x, this.position.y, potentialZ]);
            if (collisionZ) this.velocity.setZ(0);
        }

        this.updateMovement(deltaTime, movementSpeed);
        this.updateCamera(deltaTime);
    }

    private createTerrainCollisionBoxes([x, y, z]: Vector3Tuple): boolean {
        this.collisionBox.set(new Vector3(x - 0.35, y, z - 0.35), new Vector3(x + 0.35, y + 1.8, z + 0.35));

        const [blockX, blockY, blockZ] = [Math.floor(x + 0.5), Math.floor(y + 0.5), Math.floor(z + 0.5)];
        for (let ix = -2; ix < 2; ix += 1) {
            for (let iy = -2; iy < 3; iy += 1) {
                for (let iz = -2; iz < 2; iz += 1) {
                    const boxIndex = xyzTupelToIndex(ix + 2, iy + 2, iz + 2, 5, 5)
                    if (!this.terrainCollisionBoxes[boxIndex]) {
                        this.terrainCollisionBoxes[boxIndex] = new Box3();
                    }

                    const block = Game.main.level.getBlockAt(new Vector3(blockX + ix, blockY + iy, blockZ + iz));
                    const solidBlock = block !== undefined && block !== Blocks.AIR;
                    this.terrainCollisionBoxes[boxIndex].set(
                        new Vector3(blockX + ix, blockY + iy, blockZ + iz),
                        new Vector3(blockX + ix + 1, blockY + iy + 1, blockZ + iz + 1),
                    );

                    if (!solidBlock) {
                        continue;
                    }

                    const collision = this.terrainCollisionBoxes[boxIndex].intersectsBox(this.collisionBox);
                    if (collision) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    private updateMovement(deltaTime: number, movementSpeed: number): void {
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime).multiply(new Vector3(movementSpeed, 1, movementSpeed)));
    }

    private updateCamera(deltaTime: number) {
        this.camera.position.set(this.position.x, this.position.y + 1.8, this.position.z);
        this.rotation.x = MathUtils.clamp(
            this.rotation.x + degToRad(deltaTime * this.input.getMouseDelta()[1] * -0.01),
            -0.4999 * Math.PI,
            0.4999 * Math.PI,
        );
        this.rotation.y += degToRad(deltaTime * this.input.getMouseDelta()[0] * -0.01);
        const phi = this.rotation.x - 0.5 * Math.PI;
        const theta = this.rotation.y;
        const target = new Vector3().setFromSphericalCoords(1, phi, theta).add(this.camera.position);
        this.camera.lookAt(target)
    }
}
