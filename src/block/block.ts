import { BlockFace } from "./block-face";

export abstract class Block {
    public constructor(public readonly id: number) {}

    public abstract getTexture(face: BlockFace): string;
    public abstract getTextures(): string[];
}

export class UniTextureBlock extends Block {
    public constructor(
        readonly id: number,
        private readonly textureSrc: string,
    ) {
        super(id);
    }

    public getTexture(): string {
        return this.textureSrc;
    }

    public getTextures(): string[] {
        return [this.textureSrc];
    }
}

export class MultiTextureBlock extends Block {
    public constructor(
        readonly id: number,
        private readonly textureSources: Record<BlockFace, string>,
    ) {
        super(id);
    }

    public getTexture(face: BlockFace): string {
        return this.textureSources[face];
    }

    public getTextures(): string[] {
        return Object.values(this.textureSources);
    }
}

export class BarrelTextureBlock extends Block {
    public constructor(
        readonly id: number,
        private readonly topBottomTextureSource: string,
        private readonly sideTextureSource: string,
    ) {
        super(id);
    }

    public getTexture(face: BlockFace): string {
        return face === BlockFace.TOP || face === BlockFace.BOTTOM ? this.topBottomTextureSource : this.sideTextureSource;
    }

    public getTextures(): string[] {
        return [this.topBottomTextureSource, this.sideTextureSource];
    }
}
