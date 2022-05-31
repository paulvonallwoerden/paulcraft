import { Vector2 } from 'three';
import { UiElement } from '../ui/ui-element';
import { UiInterface } from '../ui/ui-interface';
import { UiText } from '../ui/ui-text';
import { Inventory } from './inventory';

export class InventoryUi extends UiInterface {
    public readonly textItems: UiText[] = [];
    
    private selectedSlot = 0;

    public constructor(private readonly inventory: Inventory) {
        super();

        for (let i = 0; i < inventory.slotCount; i++) {
            this.textItems.push(new UiText(this));
        }
    }

    public draw(screenSize: Vector2): void {
        this.textItems.forEach((text, i) => {
            const stack = this.inventory.getSlot(i);
            if (!stack) {
                text.setText('');

                return;
            }

            let line = `${stack.item.displayName} (${stack.count})`;
            text.setText(`${i === this.selectedSlot ? '>>' : ''} ${line}`);
            text.setPosition(2, i * 1.1 + 2);
        });
    }

    public getElements(): UiElement[] {
        return this.textItems;
    }

    public setSelectedSlot(i: number): void {
        this.selectedSlot = i;
    }
}
