import { Item } from '../item/item';
import { ItemStack } from './item-stack';

export class Inventory {
    private readonly slots: ItemStack[];

    public constructor(public readonly slotCount: number) {
        this.slots = new Array(slotCount);
    }

    public put(item: Item, count = 1): boolean {
        const slot = this.findSlot(item);
        if (slot >= 0) {
            this.slots[slot].count += count;

            return true;
        }

        const freeSlot = this.findFreeSlot();
        if (freeSlot < 0) {
            return false;
        }

        this.slots[freeSlot] = new ItemStack(item, count);

        return true;
    }

    public take(item: Item, count = 1): boolean {
        const slot = this.findSlot(item);
        if (slot < 0) {
            return false;
        }
        const stack = this.slots[slot];
        if (stack.count < count) {
            return false;
        }

        stack.count -= count;
        if (stack.count <= 0) {
            delete this.slots[slot];
        }

        return true;
    }

    public has(item: Item): boolean {
        return this.findSlot(item) >= 0;
    }

    public getSlot(index: number): ItemStack| undefined {
        return this.slots[index];
    }

    public tidy() {
        const filtered = [...this.slots].filter((slot) => slot !== undefined);
        for (let i = 0; i < filtered.length; i++) {
            this.slots[i] = filtered[i];
        }
        for (let i = filtered.length; i < this.slotCount; i++) {
            delete this.slots[i];
        }
    }

    public countUsedSlots(): number {
        return this.slots.reduce((count, slot) => slot ? count + 1 : count, 0);
    }

    protected findSlot(item: Item): number {
        return this.slots.findIndex((slot) => slot && slot.item === item);
    }

    protected findFreeSlot(): number {
        return this.slots.findIndex((slot) => !slot);
    }
}
