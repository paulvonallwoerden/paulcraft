import { CanvasTexture, ImageLoader, NearestFilter, Texture } from "three";
import pMap from "p-map";
import { indexToXZ } from "../util/index-to-vector2";

// FIXME: The same texture will be included multiple times.
export class TextureAtlas {
    private atlas?: Texture;
    private readonly atlasWidth: number;
    private readonly textureWidth: number;

    public constructor(readonly textureSources: string[]) {
        this.textureWidth = 32;
        this.atlasWidth = 16;
    }

    public async buildAtlas() {
        const imageLoader = new ImageLoader();
        const images = await pMap(this.textureSources, (source) => imageLoader.loadAsync(source));

        const canvas = document.createElement('canvas');
        canvas.setAttribute('style', "image-rendering: pixelated; image-rendering: crisp-edges;");
        canvas.width = this.atlasWidth * this.textureWidth;
        canvas.height = this.atlasWidth * this.textureWidth;
        const context = canvas.getContext('2d');
        if (!context) {
            throw new Error('Canvas context couldn\'t be created!');
        }

        // context.fillStyle = 'pink';
        // context.fillRect(0, 0, this.atlasWidth * this.textureWidth, this.atlasWidth * this.textureWidth);

        for (let i = 0; i < images.length; i++) {
            const [x, y] = indexToXZ(i, this.atlasWidth).toArray();
            context.drawImage(images[i], x * this.textureWidth, y * this.textureWidth);
        }

        this.atlas = new CanvasTexture(canvas, undefined, undefined, undefined, NearestFilter, NearestFilter);
    }

    public getAtlas(): Texture {
        if (!this.atlas) {
            throw new Error('Cannot return atlas before building it!');
        }

        return this.atlas;
    }

    public getTextureUv(index: number): number[] {
        const [x, y] = indexToXZ(index, this.atlasWidth).toArray();

        const unit = 1 / this.atlasWidth;
        const uvX = x / this.atlasWidth;
        const uvY = 1 - (y / this.atlasWidth) - unit;

        return [
            [uvX,           uvY],
            [uvX + unit,    uvY],
            [uvX,           uvY + unit],
            [uvX + unit,    uvY + unit],
        ].flat();
    }
}
