import { Item } from '../item/item';

export class ItemStack {
    public constructor(
        public readonly item: Item,
        public count: number = 1,
    ) {}
}
