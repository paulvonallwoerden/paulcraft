import { Player } from '../player/player';
import { World } from '../world/world';

export enum UseAction {
    Primary,
    Secondary,
}

export class Item {
    public constructor(
        public readonly name: string,
        public readonly displayName: string,
    ) {}

    public onUse(action: UseAction, world: World, player: Player): boolean {
        return false;
    }

    public getDisplayImage(): string {
        return 'textures/sun.png';
    }
}
