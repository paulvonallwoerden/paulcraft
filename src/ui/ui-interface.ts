import { Vector2 } from 'three';
import { UiElement } from './ui-element';
import { UiManager } from './ui-manager';

export abstract class UiInterface {
    private dirtyElements: number[] = [];

    public init(uiManager: UiManager) {
        this.getElements().forEach((element) => element.onAdd(uiManager));
    }

    public abstract draw(screenSize: Vector2): void;

    public onAfterDraw(uiManager: UiManager, screenSize: Vector2): void {
        this.getElements().forEach((element) => {
            if (!this.dirtyElements.includes(element.id)) {
                return;
            }

            element.draw(uiManager, screenSize);
        });

        this.dirtyElements = [];
    }

    public abstract getElements(): UiElement[];

    public flagElementDirty(elementId: number) {
        this.dirtyElements.push(elementId);
    }
}
