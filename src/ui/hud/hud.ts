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
        this.textChunkPosition.setPosition(1, 1);

        this.textSelectedBlock.setText(`Selected block: ${Blocks.getBlockById(this.player.selectedBlockId).displayName}`);
        this.textSelectedBlock.setPosition((size.x / 2) - (this.textSelectedBlock.getTextWidth() / 2), 1);
    }

    public getElements(): UiElement[] {
        return [
            this.textChunkPosition,
            this.textSelectedBlock,
        ];
    }
}
