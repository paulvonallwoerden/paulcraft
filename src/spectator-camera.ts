import { Camera, Euler, PerspectiveCamera, Quaternion, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Game } from "./game";

export class SpectatorCamera {
    public readonly camera: Camera;
    private readonly controls: OrbitControls;

    // private pressedKeys: string[] = [];

    public constructor(private readonly aspectRatio: number) {
        this.camera = new PerspectiveCamera(75, aspectRatio, 0.1, 100000);
        this.camera.position.set(-32 * 4, 100 * 2, -32 * 4);

        // document.body.addEventListener('keydown', (event) => this.pressedKeys.push(event.key));
        // document.body.addEventListener('keyup', (event) => {
        //     this.pressedKeys = this.pressedKeys.filter((key) => key !== event.key)
        // });

        this.controls = new OrbitControls(this.camera, Game.main.renderer.domElement);
        this.controls.target = new Vector3(128, 50, 128);
    }

    public update(deltaTime: number) {
        this.controls.update();

        // if (this.isKeyPressed('a')) this.rotate(deltaTime, 0.005);
        // if (this.isKeyPressed('d')) this.rotate(deltaTime, -0.005);

        // if (this.isKeyPressed('e')) this.moveVertically(deltaTime,  0.01);
        // if (this.isKeyPressed('q')) this.moveVertically(deltaTime, -0.01);

        // if (this.isKeyPressed('w')) this.moveHorizontally(deltaTime, 0.01);
        // if (this.isKeyPressed('s')) this.moveHorizontally(deltaTime, -0.01);
    }

    // private isKeyPressed(key: string): boolean {
    //     return this.pressedKeys.includes(key);
    // }

    // private rotate(deltaTime: number, rotation: number) {
    //     this.camera.rotateY(deltaTime * rotation);
    // }

    // private moveHorizontally(deltaTime: number, amount: number) {
    //     const directionAngle = this.camera.rotation.y; // * (180 / Math.PI);
    //     const direction = new Vector3(Math.cos(directionAngle), 0, Math.sin(directionAngle));

    //     const movement = direction.multiplyScalar(amount * deltaTime);
    //     this.camera.position.add(movement);
    // }

    // private moveVertically(deltaTime: number, amount: number) {
    //     this.camera.position.setY(this.camera.position.y + deltaTime * amount);
    // }
}
