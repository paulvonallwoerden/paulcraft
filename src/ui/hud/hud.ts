import { Vector2 } from 'three';
import { modifyBlockPosValues } from '../../block/block-pos';
import { Blocks } from '../../block/blocks';
import { Player } from '../../player/player';
import { UiElement } from '../ui-element';
import { UiInterface } from '../ui-interface';
import { UiText } from '../ui-text';

export class Hud extends UiInterface {
    private readonly textPosition = new UiText(this);
    private readonly textFps = new UiText(this);

    private lastUpdate = 0;
    private updateFpsIn = 100;
    private fps = 0;

    public constructor(private readonly player: Player) {
        super();
    }

    public draw(size: Vector2): void {
        const playerPosition = modifyBlockPosValues(this.player.position, (v) => Math.round(v * 10) / 10);
        const formatCoord = (v: number) => Number.isInteger(v) ? `${v}.0` : `${v}`;
        this.textPosition.setText(`Position: ${formatCoord(playerPosition.x)}, ${formatCoord(playerPosition.y)}, ${formatCoord(playerPosition.z)}`);
        this.textPosition.setPosition(1, size.y - 2);

        const delta = Date.now() - this.lastUpdate;
        this.lastUpdate = Date.now();

        this.updateFpsIn = this.updateFpsIn - delta;
        if (this.updateFpsIn <= 0) {
            this.fps = Math.round(1000 / delta);
            this.updateFpsIn = 50;
        }

        this.textFps.setText(`Fps: ${this.fps}`);
        this.textFps.setPosition(1, size.y - 3.5);
    }

    public getElements(): UiElement[] {
        return [
            this.textPosition,
            this.textFps,
        ];
    }
}
