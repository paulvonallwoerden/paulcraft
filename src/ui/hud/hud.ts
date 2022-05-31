import { Vector2 } from 'three';
import { Blocks } from '../../block/blocks';
import { Player } from '../../player/player';
import { UiElement } from '../ui-element';
import { UiInterface } from '../ui-interface';
import { UiText } from '../ui-text';

export class Hud extends UiInterface {
    private readonly textChunkPosition = new UiText(this);
    private readonly textSelectedBlock = new UiText(this);

    public constructor(private readonly player: Player) {
        super();
    }

    public draw(size: Vector2): void {
        this.textChunkPosition.setText(`Chunk: ${this.player.getChunkPosition().join(', ')}`);
        this.textChunkPosition.setPosition(
            size.x - (this.textChunkPosition.getTextWidth() + 1),
            size.y - 2,
        );

        const selectedItem = this.getSelectedItem();
        if (selectedItem) {
            this.textSelectedBlock.setText(`Use Q & E to select another item`);
        } else {
            this.textSelectedBlock.setText('Your hands are empty! Press \'M\' to cheat <3');
        }
        this.textSelectedBlock.setPosition((size.x / 2) - (this.textSelectedBlock.getTextWidth() / 2), 1);
    }

    private getSelectedItem(): string | undefined {
        const { inventory, selectedInventorySlot } = this.player;
        const itemStack = inventory.getSlot(selectedInventorySlot);
        if (!itemStack) {
            return undefined;
        }

        return itemStack.item.displayName;
    }

    public getElements(): UiElement[] {
        return [
            this.textChunkPosition,
            this.textSelectedBlock,
        ];
    }
}
