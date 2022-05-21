export function removeDuplicates<T>(array: T[], compare = (a: T, b: T) => a === b): T[] {
    const cleanedArray: T[] = [];
    for (const item of array) {
        if (!cleanedArray.some((cleanedItem) => compare(item, cleanedItem))) {
            cleanedArray.push(item);
        }
    }

    return cleanedArray;
}
