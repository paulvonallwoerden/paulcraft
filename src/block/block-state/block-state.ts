export type Json = object;

export type BlockStateValues = { [name: string]: (number | string | boolean) };

export class BlockState<T extends BlockStateValues> {
    private constructor(private readonly values: T) {}

    public get<N extends keyof T>(name: N): T[N] {
        return this.values[name];
    }

    public toJson(): Json {
        return this.values;
    }

    public static fromJson<K extends BlockStateValues>(raw: Json): BlockState<K> {
        return new BlockState<any>(raw);
    }
}
