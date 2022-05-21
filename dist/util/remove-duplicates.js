export function removeDuplicates(array, compare) {
    if (compare === void 0) { compare = function (a, b) { return a === b; }; }
    var cleanedArray = [];
    var _loop_1 = function (item) {
        if (!cleanedArray.some(function (cleanedItem) { return compare(item, cleanedItem); })) {
            cleanedArray.push(item);
        }
    };
    for (var _i = 0, array_1 = array; _i < array_1.length; _i++) {
        var item = array_1[_i];
        _loop_1(item);
    }
    return cleanedArray;
}
