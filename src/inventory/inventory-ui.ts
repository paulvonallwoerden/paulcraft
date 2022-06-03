import { Color, Vector2 } from 'three';
import { lerp } from 'three/src/math/MathUtils';
import { UiElement } from '../ui/ui-element';
import { UiImage } from '../ui/ui-image';
import { UiInterface } from '../ui/ui-interface';
import { UiText } from '../ui/ui-text';
import { clamp } from '../util/clamp';
import { Inventory } from './inventory';

const HOT_BAR_SIZE = new Vector2(362, 42);
const HOT_BAR_CURSOR_SIZE = new Vector2(44, 44);

export class InventoryUi extends UiInterface {
    private readonly imageItems: UiImage[] = [];
    private readonly textItemCounts: UiText[] = [];

    private readonly textItem = new UiText(this);
    private readonly imageHotBar = new UiImage(this, 'textures/ui/hotbar.png');
    private readonly imageHotBarCursor = new UiImage(this, 'textures/ui/hotbar_cursor.png', { transparent: true });

    private itemTextTime = 0;
    private selectedSlot = 0;

    public constructor(private readonly inventory: Inventory) {
        super();

        for (let i = 0; i < 9; i++) {
            this.imageItems.push(new UiImage(this, undefined, { transparent: true }));
            this.textItemCounts.push(new UiText(this));
        }
    }

    public draw(screenSize: Vector2, deltaTime: number): void {
        const hotBarSize = HOT_BAR_SIZE.clone().multiplyScalar(1 / 16);
        this.imageHotBar.setSize(hotBarSize);
        this.imageHotBar.setPosition(screenSize.x / 2, 1.5);

        const hotBarCursorSize = HOT_BAR_CURSOR_SIZE.clone().multiplyScalar(1 / 16);
        this.imageHotBarCursor.setSize(hotBarCursorSize);
        const cursorOffset = (hotBarSize.x / 2) - (hotBarCursorSize.x / 2); // - 17 / 16;
        const cursorLeft = (screenSize.x / 2) - cursorOffset;
        const cursorRight = (screenSize.x / 2) + cursorOffset;
        this.imageHotBarCursor.setPosition(lerp(cursorLeft, cursorRight, Math.min(1, this.selectedSlot / 8)), 1.5);

        this.imageItems.forEach((image, i) => {
            const stack = this.inventory.getSlot(i);
            if (!stack) {
                image.setPosition(0, 0);

                return;
            }

            image.setSrc(stack.item.getDisplayImage());
            image.setSize(hotBarCursorSize.clone().multiplyScalar(2 / 3));
            const xPos = lerp(cursorLeft, cursorRight, Math.min(1, i / 8));
            image.setPosition(xPos , 1.5);

            this.textItemCounts[i].setText(stack.count.toString(10));
            const textWidth = this.textItemCounts[i].getTextWidth();
            this.textItemCounts[i].setPosition(xPos - textWidth + 1, 0.5);
        });

        const selectedStack = this.inventory.getSlot(this.selectedSlot);
        if (selectedStack) {
            this.textItem.setText(selectedStack.item.displayName);
            this.textItem.setPosition(
                screenSize.x / 2 - this.textItem.getTextWidth() / 2,
                hotBarSize.y + 1,
            );
        }

        this.itemTextTime += deltaTime;
        this.textItem.setColor(new Color(1, 1, 1), clamp(2 - this.itemTextTime / 1000, 0, 1));
    }

    public getElements(): UiElement[] {
        return [
            this.imageHotBar,
            this.imageHotBarCursor,
            this.textItem,
            ...this.imageItems,
            ...this.textItemCounts,
        ];
    }

    public setSelectedSlot(i: number): void {
        this.selectedSlot = i;
        this.itemTextTime = 0;
    }
}
