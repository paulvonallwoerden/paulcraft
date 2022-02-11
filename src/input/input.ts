import { Vector2Tuple } from "three";

export const LeftMouseButton = 'mouse:0';
export const RightMouseButton = 'mouse:2';

export class Input {
    private pressedKeys: Record<string, boolean> = {};
    private downedKeys: Record<string, boolean> = {};

    private currentMouseDelta: Vector2Tuple = [0, 0];
    private calculatedMouseDelta: Vector2Tuple = [0, 0];

    public constructor(readonly domElement: HTMLElement) {
        domElement.addEventListener('keydown', this.onKeyDown.bind(this));
        domElement.addEventListener('keyup', this.onKeyUp.bind(this));
        domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
        domElement.addEventListener('mousedown', this.onMouseDown.bind(this));
        domElement.addEventListener('mouseup', this.onMouseUp.bind(this));
    }

    public isKeyPressed(key: string) {
        return this.pressedKeys[key.toLowerCase()] === true;
    }

    /**
     * Like isKeyPressed but only returns true for the frame the key was pressed.
     */
    public isKeyDowned(key: string): boolean {
        return this.downedKeys[key.toLowerCase()] === true;
    }

    public getMouseDelta() {
        return this.calculatedMouseDelta;
    }

    public lateUpdate() {
        this.calculatedMouseDelta = this.currentMouseDelta;
        this.currentMouseDelta = [0, 0];
        
        this.downedKeys = Object.keys(this.downedKeys).reduce((obj, key) => ({ ...obj, [key]: false }), {});
    }

    private onMouseMove(event: MouseEvent) {
        this.currentMouseDelta = [
            this.currentMouseDelta[0] + event.movementX,
            this.currentMouseDelta[1] + event.movementY,
        ];
    }

    private onMouseDown(event: MouseEvent) {
        this.setKey(`mouse:${event.button}`);
    }

    private onMouseUp(event: MouseEvent) {
        this.unsetKey(`mouse:${event.button}`);
    }

    private onKeyDown(event: KeyboardEvent) {
        this.setKey(event.key);
    }

    private onKeyUp(event: KeyboardEvent) {
        this.unsetKey(event.key);
    }

    private setKey(key: string) {
        this.pressedKeys[key.toLowerCase()] = true;

        if (this.downedKeys[key.toLowerCase()] === undefined) {
            this.downedKeys[key.toLowerCase()] = true;
        }
    }

    private unsetKey(key: string) {
        this.pressedKeys[key.toLowerCase()] = false;
        delete this.downedKeys[key.toLowerCase()];
    }
}
