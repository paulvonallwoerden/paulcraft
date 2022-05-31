import { Object3D, Vector2 } from 'three';
import { UiInterface } from './ui-interface';
import { UiManager } from './ui-manager';

export abstract class UiElement {
    public readonly id = UiElement.nextId++;
    private static nextId = 0;

    public readonly position = new Vector2();

    protected ui?: UiManager;

    public constructor(public readonly uiInterface: UiInterface) {}

    public onAdd(ui: UiManager) {
        this.ui = ui;
    }
    
    public setPosition(x: number, y: number) {
        if (this.position.x === x && this.position.y === y) {
            return;
        }

        this.position.set(x, y);
        this.setDirty();
    }

    protected setDirty() {
        this.uiInterface.flagElementDirty(this.id);
    }

    public register(parent: Object3D): void {}
    public unregister(parent: Object3D): void {}
    public abstract draw(ui: UiManager, screenSize: Vector2): void;
}
