import { Vector2 } from 'three';
import { UiElement } from './ui-element';
import { UiImage } from './ui-image';
import { UiInterface } from './ui-interface';
import { UiText } from './ui-text';

export class EnteringWorldUi extends UiInterface {
    public readonly zIndex = 5;
    private progress: number = 0;

    private readonly textLoading = new UiText(this);
    private readonly textProgress = new UiText(this);
    private readonly imageBackground = new UiImage(this, 'textures/background.png');

    public draw(screenSize: Vector2): void {
        this.textLoading.setText('Preparing world...');
        this.textProgress.setText(`${Math.round(this.progress * 100)} %`);

        this.textLoading.setPosition(
            screenSize.x / 2 - this.textLoading.getTextWidth() / 2,
            screenSize.y / 2,
        );
        this.textProgress.setPosition(
            screenSize.x / 2 - this.textProgress.getTextWidth() / 2,
            screenSize.y / 2 - 1.5,
        );

        this.imageBackground.setPosition(screenSize.x / 2, screenSize.y / 2);
        this.imageBackground.setSize(screenSize);
        this.imageBackground.setRepeat(screenSize.clone().divideScalar(10));
        this.imageBackground.setColor(0x7a7a7a);
    }

    public setProgress(progress: number): void {
        this.progress = progress;
    }

    public getElements(): UiElement[] {
        return [this.textProgress, this.textLoading, this.imageBackground];
    }
}
