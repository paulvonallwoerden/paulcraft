import { Game } from "../game";
import { World } from "../world/world";
import { Block } from "./block";
import { BlockFaces } from "./block-face";
import { BlockModel } from "./block-model/block-model";
import { BlockPos } from "./block-pos";
import { BlockState } from "./block-state/block-state";
import { Blocks } from "./blocks";

export function makeClosedDoorBlockModel(rotation: number, texture: string): BlockModel {
    return {
        rotation: {
            angle: rotation,
            axis: 'y'
        },
        elements: [
            {
                from: [0, 0, 0],
                to: [2, 15, 15],
                faces: BlockFaces.reduce((faces, face) => ({
                    ...faces,
                    [face]: { texture },
                }), {}),
            },
        ],
    };
}

export function makeOpenedDoorBlockModel(rotation: number, texture: string): BlockModel {
    return {
        rotation: {
            angle: rotation,
            axis: 'y'
        },
        elements: [
            {
                from: [0, 0, 0],
                to: [15, 15, 2],
                faces: BlockFaces.reduce((faces, face) => ({
                    ...faces,
                    [face]: { texture },
                }), {}),
            },
        ],
    };
}

const DefaultDoorBlockStateValues = { open: false, isTop: false };
type DoorBlockStateValues = typeof DefaultDoorBlockStateValues;

export class DoorBlock extends Block {
    public constructor() {
        super('door', [
            makeClosedDoorBlockModel(0, 'textures/blocks/oak_door_bottom.png'),
            makeOpenedDoorBlockModel(0, 'textures/blocks/oak_door_bottom.png'),
            makeClosedDoorBlockModel(0, 'textures/blocks/oak_door_top.png'),
            makeOpenedDoorBlockModel(0, 'textures/blocks/oak_door_top.png'),
        ]);
    }

    public getBlockModel(blockState: BlockState<DoorBlockStateValues>): number {
        const open = blockState.get('open');
        const top = blockState.get('isTop');

        return (top ? 2 : 0) + (open ? 1 : 0);
    }

    public onSetBlock(world: World, pos: BlockPos): void {
        const existingState = world.getBlockState(pos);
        if (existingState !== undefined) {
            return;
        }

        world.setBlockState(pos, new BlockState({ ...DefaultDoorBlockStateValues }));
    }

    public onPlace(world: World, pos: BlockPos): boolean {
        const topPos = { ...pos, y: pos.y + 1 };
        world.setBlockState(topPos, new BlockState({ ...DefaultDoorBlockStateValues, isTop: true }));
        world.setBlock(topPos, Blocks.DOOR);

        return true;
    }

    public onInteract(world: World, pos: BlockPos): boolean {
        const topPos = { ...pos, y: pos.y + 1 };
        const top = world.getBlock(topPos);
        if (top instanceof DoorBlock) {
            top.toggleOpen(world, topPos);
            this.toggleOpen(world, pos, true);
        } else {
            const bottomPos = { ...pos, y: pos.y - 1 };
            const bottom = world.getBlock(bottomPos);
            if (bottom instanceof DoorBlock) {
                bottom.toggleOpen(world, bottomPos);
                this.toggleOpen(world, pos, true);
            }
        }

        return true;
    }

    public onBreak(world: World, pos: BlockPos): void {
        const topPos = { ...pos, y: pos.y + 1 };
        const top = world.getBlock(topPos);
        if (top instanceof DoorBlock) {
            world.setBlock(topPos, Blocks.AIR);
        } else {
            const bottomPos = { ...pos, y: pos.y - 1 };
            const bottom = world.getBlock(bottomPos);
            if (bottom instanceof DoorBlock) {
                world.setBlock(bottomPos, Blocks.AIR);
            }
        }
    }

    public isCollidable(world: World, pos: BlockPos): boolean {
        const state = world.getBlockState<DoorBlockStateValues>(pos)!;

        return !state.get('open');
    }

    protected toggleOpen(world: World, pos: BlockPos, playSound = false) {
        const state = world.getBlockState(pos)!;
        state.set('open', !state.get('open'));
        world.setBlockState(pos, state);

        if (playSound) {
            Game.main.audioManager.playSound('block.door.open');
        }
    }
}
