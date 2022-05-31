var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { ItemStack } from './item-stack';
var Inventory = /** @class */ (function () {
    function Inventory(slotCount) {
        this.slotCount = slotCount;
        this.slots = new Array(slotCount);
    }
    Inventory.prototype.put = function (item, count) {
        if (count === void 0) { count = 1; }
        var slot = this.findSlot(item);
        if (slot >= 0) {
            this.slots[slot].count += count;
            return true;
        }
        var freeSlot = this.findFreeSlot();
        if (freeSlot < 0) {
            return false;
        }
        this.slots[freeSlot] = new ItemStack(item, count);
        return true;
    };
    Inventory.prototype.take = function (item, count) {
        if (count === void 0) { count = 1; }
        var slot = this.findSlot(item);
        if (slot < 0) {
            return false;
        }
        var stack = this.slots[slot];
        if (stack.count < count) {
            return false;
        }
        stack.count -= count;
        if (stack.count <= 0) {
            delete this.slots[slot];
        }
        return true;
    };
    Inventory.prototype.has = function (item) {
        return this.findSlot(item) >= 0;
    };
    Inventory.prototype.getSlot = function (index) {
        return this.slots[index];
    };
    Inventory.prototype.tidy = function () {
        var filtered = __spreadArray([], this.slots, true).filter(function (slot) { return slot !== undefined; });
        for (var i = 0; i < filtered.length; i++) {
            this.slots[i] = filtered[i];
        }
        for (var i = filtered.length; i < this.slotCount; i++) {
            delete this.slots[i];
        }
    };
    Inventory.prototype.countUsedSlots = function () {
        return this.slots.reduce(function (count, slot) { return slot ? count + 1 : count; }, 0);
    };
    Inventory.prototype.findSlot = function (item) {
        return this.slots.findIndex(function (slot) { return slot && slot.item === item; });
    };
    Inventory.prototype.findFreeSlot = function () {
        return this.slots.findIndex(function (slot) { return !slot; });
    };
    return Inventory;
}());
export { Inventory };
