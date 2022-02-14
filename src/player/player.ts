import pMap from "p-map";
import { Audio, AudioLoader, Box3, Box3Helper, Camera, Color, DoubleSide, Euler, Intersection, MathUtils, Mesh, MeshStandardMaterial, Plane, PlaneGeometry, Quaternion, Raycaster, Side, SphereGeometry, Vector2, Vector3, Vector3Tuple } from "three";
import * as three from 'three';
import { degToRad, radToDeg } from "three/src/math/MathUtils";
// @ts-ignore
import ParticleSystem from "three-nebula";
import { AIR_BLOCK_ID, STONE_BLOCK_ID, SUGAR_CANE_BLOCK_ID } from "../block/block-ids";
import { Game } from "../game";
import { Input, LeftMouseButton, RightMouseButton } from "../input/input";
import { xyzTupelToIndex } from "../util/index-to-vector3";
import { randomElement } from "../util/random-element";

export class Player {
    private readonly walkingSpeed = 0.025;
    private readonly flyingSpeed = 0.065;
    private readonly raycaster: Raycaster = new Raycaster();

    private isOnGround = false;
    private velocity = new Vector3();

    private flying = true;
    private noclip = false;

    private start = false;

    private readonly collisionBox = new Box3(new Vector3(-0.35, 0, -0.35), new Vector3(0.35, 1.8, 0.35));

    private readonly planeGeometry = new SphereGeometry(0);
    private readonly collMatZ = new MeshStandardMaterial({ color: 0x0000ff, side: DoubleSide });
    private readonly collMatY = new MeshStandardMaterial({ color: 0x00ff00, side: DoubleSide });
    private readonly collMatX = new MeshStandardMaterial({ color: 0xff0000, side: DoubleSide });
    private readonly collMatPP = new MeshStandardMaterial({ color: 0xffff00, side: DoubleSide });
    private readonly collMatAP = new MeshStandardMaterial({ color: 0x00ffff, side: DoubleSide });
    private readonly collMatAPlayer = new MeshStandardMaterial({ color: 0x000000, side: DoubleSide });
    private readonly collMesh: Mesh[] = [
        new Mesh(this.planeGeometry, this.collMatZ),
        new Mesh(this.planeGeometry, this.collMatZ),
        new Mesh(this.planeGeometry, this.collMatX),
        new Mesh(this.planeGeometry, this.collMatX),
        new Mesh(this.planeGeometry, this.collMatX),
        new Mesh(this.planeGeometry, this.collMatPP),
        new Mesh(this.planeGeometry, this.collMatAP),

        // 7 - 14
        new Mesh(this.planeGeometry, this.collMatAPlayer),
        new Mesh(this.planeGeometry, this.collMatAPlayer),
        new Mesh(this.planeGeometry, this.collMatAPlayer),
        new Mesh(this.planeGeometry, this.collMatAPlayer),
        new Mesh(this.planeGeometry, this.collMatAPlayer),
        new Mesh(this.planeGeometry, this.collMatAPlayer),
        new Mesh(this.planeGeometry, this.collMatAPlayer),
        new Mesh(this.planeGeometry, this.collMatAPlayer),
    ];

    private readonly boxZPos = new Box3();
    private readonly boxZNeg = new Box3();

    private readonly terrainCollisionBoxes: Box3[] = [];
    private readonly terrainCollisionBoxHelpers: Box3Helper[] = [];

    private placeBlockSounds: AudioBuffer[] = [];
    private digBlockSounds: AudioBuffer[] = [];
    private readonly audio: Audio;

    // private breakBlockParticleSystem: ParticleSystem;
    // private breakBlockParticleEmitter: ParticleSystem.Emitter;
    // private breakBlockParticleRenderer: ParticleSystem.SpriteRenderer;

    private selectedBlockId: number = 9;

    public constructor(
        private readonly camera: Camera,
        private readonly input: Input,
        private position: Vector3,
        private rotation: Vector2,
    ) {
        this.audio = new Audio(Game.main.audioListener);

        Game.main.scene.add(new Box3Helper(this.boxZPos, new Color(0, 0, 0)));

        // Game.main.scene.add(new Box3Helper(this.collisionBox, new Color(0, 0, 0)));
        

        this.collMesh[0].position.setX(0);
        this.collMesh[0].position.setY(0);
        this.collMesh[0].position.setZ(0);
        Game.main.scene.add(this.collMesh[0]);

        this.updateMovement(0, 0);

        // this.breakBlockParticleRenderer = new ParticleSystem.SpriteRenderer(Game.main.scene, three);
        // this.breakBlockParticleSystem = new ParticleSystem();
        // this.breakBlockParticleEmitter = new ParticleSystem.Emitter();
        // this.breakBlockParticleEmitter
        //     .setRate(new ParticleSystem.Rate(new ParticleSystem.Span(4, 16), new ParticleSystem.Span(0.01)))
        //     .setInitializers([
        //         new ParticleSystem.Position(new ParticleSystem.PointZone(0, 0)),
        //         new ParticleSystem.Mass(1),
        //         new ParticleSystem.Radius(6, 12),
        //         new ParticleSystem.Life(3),
        //         new ParticleSystem.RadialVelocity(45, new ParticleSystem.Vector3D(0, 1, 0), 180),
        //     ])
        //     .setBehaviours([
        //         new ParticleSystem.Alpha(1, 0),
        //         new ParticleSystem.Scale(0.1, 1.3),
        //         new ParticleSystem.Color(new Color(), new Color()),
        //     ]);
        // this.breakBlockParticleSystem
        //     .addEmitter(this.breakBlockParticleEmitter)
        //     .addRenderer(this.breakBlockParticleRenderer)
        //     .emit();
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
                this.boxZPos.set(blockPos, blockPos.clone().add(new Vector3(1, 1, 1)));

                if (this.input.isKeyDowned(LeftMouseButton)) {
                    if (this.audio.isPlaying) this.audio.stop();
                    this.audio.setBuffer(randomElement(this.digBlockSounds));
                    this.audio.play();
                    Game.main.level.setBlockAt(blockPos, AIR_BLOCK_ID);
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
                    Game.main.level.setBlockAt(blockPos, this.selectedBlockId);
                }
            }
        }

        // const intersections = this.raycaster.intersectObjects(Game.main.scene.children)
        // this.distanceToGround = intersections.reduce((min, intersection) => Math.min(min, intersection.distance), Number.MAX_VALUE);
        // if (intersections[0]) {
        //     let newVelocityY = this.velocity.y - deltaTime * 0.0015;
        //     if (Math.abs(newVelocityY) >= this.distanceToGround) {
        //     //     newVelocityY = this.distanceToGround;
        //     //     this.isOnGround = true;
        //     // } else {
        //     //     this.isOnGround = false;
        //     }

        //     if (this.isOnGround) {
        //         this.velocity.setY(0);
        //     } else {
        //         if (this.start) {
        //             // this.velocity.setY(newVelocityY);
        //         }
        //     }

        //     this.start = true;
        // }

        if (this.input.isKeyPressed(' ')) {
            this.start = true;
        }

        if (!this.start) return;

        // Inventory
        if (this.input.isKeyDowned('Q') && this.selectedBlockId > 1) {
            this.selectedBlockId--;
        }
        if (this.input.isKeyDowned('E') && this.selectedBlockId < Game.main.blocks.getNumberOfBlocks()) {
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
                inputVector.setY(0.015);
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

        // let [x, y, z] = this.position.add(this.velocity).toArray();
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
                        // this.terrainCollisionBoxHelpers[boxIndex] = new Box3Helper(this.terrainCollisionBoxes[boxIndex], new Color(1, 1, 0));
                        // Game.main.scene.add(this.terrainCollisionBoxHelpers[boxIndex]);
                    }

                    const block = Game.main.level.getBlockAt(new Vector3(blockX + ix, blockY + iy, blockZ + iz));
                    const solidBlock = block !== undefined && block !== 0 && block !== SUGAR_CANE_BLOCK_ID;
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

    private drawBox(box: Box3, colMeshOffset: number): void {
        const { min, max } = box;
        this.collMesh[colMeshOffset + 0].position.setX(min.x);
        this.collMesh[colMeshOffset + 0].position.setY(min.y);
        this.collMesh[colMeshOffset + 0].position.setZ(min.z);

        this.collMesh[colMeshOffset + 1].position.setX(max.x);
        this.collMesh[colMeshOffset + 1].position.setY(min.y);
        this.collMesh[colMeshOffset + 1].position.setZ(min.z);

        this.collMesh[colMeshOffset + 2].position.setX(min.x);
        this.collMesh[colMeshOffset + 2].position.setY(max.y);
        this.collMesh[colMeshOffset + 2].position.setZ(min.z);

        this.collMesh[colMeshOffset + 3].position.setX(min.x);
        this.collMesh[colMeshOffset + 3].position.setY(min.y);
        this.collMesh[colMeshOffset + 3].position.setZ(max.z);

        this.collMesh[colMeshOffset + 4].position.setX(max.x);
        this.collMesh[colMeshOffset + 4].position.setY(max.y);
        this.collMesh[colMeshOffset + 4].position.setZ(min.z);

        this.collMesh[colMeshOffset + 5].position.setX(max.x);
        this.collMesh[colMeshOffset + 5].position.setY(min.y);
        this.collMesh[colMeshOffset + 5].position.setZ(max.z);

        this.collMesh[colMeshOffset + 6].position.setX(min.x);
        this.collMesh[colMeshOffset + 6].position.setY(max.y);
        this.collMesh[colMeshOffset + 6].position.setZ(max.z);

        this.collMesh[colMeshOffset + 7].position.setX(max.x);
        this.collMesh[colMeshOffset + 7].position.setY(max.y);
        this.collMesh[colMeshOffset + 7].position.setZ(max.z);
    }

    private collide() {
        // {
        //     let [x, y, z] = this.position.toArray();
        //     x = Math.floor(x) + 0.5;
        //     y = Math.floor(y) + 0.5;
        //     z = Math.floor(z + 0.5);

        //     this.collMesh[0].position.setX(x);
        //     this.collMesh[0].position.setY(y);
        //     this.collMesh[0].position.setZ(z);
        // }
        // {
        //     let [x, y, z] = this.position.toArray();
        //     x = Math.floor(x + 0.5);
        //     y = Math.floor(y) + 0.5;
        //     z = Math.floor(z) + 0.5;

        //     this.collMesh[2].position.setX(x);
        //     this.collMesh[2].position.setY(y);
        //     this.collMesh[2].position.setZ(z);
        // }
    }

    private updateMovement(deltaTime: number, movementSpeed: number): void {
        // let inputMovement = new Vector2(
        //     this.input.isKeyPressed('W') ? -1 : (this.input.isKeyPressed('S') ? 1 : 0),
        //     this.input.isKeyPressed('A') ? -1 : (this.input.isKeyPressed('D') ? 1 : 0),
        // );
        // if (inputMovement.length() > 1) {
        //     inputMovement = inputMovement.normalize();
        // }

        // let yMovement = 0;
        // if (this.input.isKeyPressed(' ')) {
        //     yMovement += 1;
        // }

        // if (this.input.isKeyPressed('Shift')) {
        //     yMovement -= 1;
        // }

        this.position.add(this.velocity.clone().multiplyScalar(deltaTime).multiply(new Vector3(movementSpeed, 1, movementSpeed)));
        // this.position.add(new Vector3(
        //     deltaTime * forward.y * this.velocity.x * this.movementSpeed,
        //     this.velocity.y,
        //     deltaTime * forward.x * this.velocity.x * this.movementSpeed,
        // )).add(new Vector3(
        //     deltaTime * right.y * this.velocity.z * this.movementSpeed,
        //     0,
        //     deltaTime * right.x * this.velocity.z * this.movementSpeed,
        // ));
        this.camera.position.set(this.position.x, this.position.y + 1.8, this.position.z);

        // Camera
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
