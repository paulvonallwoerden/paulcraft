import { Block } from '../block/block';
import { Blocks } from '../block/blocks';
import { BlockItem } from './block-item';
import { BombItem } from './bomb-item';
import { Item } from './item';

export class Items {
    public static readonly BOMB = new BombItem();

    private static readonly items: Item[] = [
        Items.BOMB,
        ...Blocks.listBlocks().map((block) => new BlockItem(block)),
    ];

    public static getItemByName(name: string): Item | undefined {
        return Items.items.find((item) => item.name === name);
    }

    public static getBlockItem(block: Block): Item {
        const blockItem = Items.getItemByName(block.name);
        if (!blockItem) {
            throw new Error(`Block item for block ${block.name} not found!`);
        }

        return blockItem;
    }
}
