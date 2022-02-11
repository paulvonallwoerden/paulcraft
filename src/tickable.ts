export interface ITickable {
    /**
     * @property deltaTime time since last tick.
     */
    onTick(deltaTime: number): void;
}
