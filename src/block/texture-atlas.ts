import { CanvasTexture, ImageLoader, NearestFilter, Texture } from "three";
import pMap from "p-map";
import { indexToXZ } from "../util/index-to-vector2";
import { removeDuplicates } from "../util/remove-duplicates";

// TODO: Add mip maps
export class TextureAtlas {
    private readonly atlasWidth: number;
    private readonly textureWidth: number;

    public constructor(private readonly textureSources: string[]) {
        // TODO: Make this configurable. Especially, the atlas width should be computed dynamically.
        this.textureWidth = 32;
        this.atlasWidth = 16;
    }

    public async buildAtlas(): Promise<Texture> {
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

        for (let i = 0; i < images.length; i++) {
            const [x, y] = indexToXZ(i, this.atlasWidth).toArray();
            context.drawImage(images[i], x * this.textureWidth, y * this.textureWidth);
        }

        return new CanvasTexture(canvas, undefined, undefined, undefined, NearestFilter, NearestFilter);
    }

    public getTextureUv(name: string): number[] {
        const index = this.textureSources.indexOf(name);
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
