export function getBlockModelTextures(blockModel) {
    var faces = blockModel.elements.flatMap(function (element) { return Object.values(element.faces); });
    return faces.map(function (face) { return face.texture; });
}
