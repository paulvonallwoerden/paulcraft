export function areBlockLightPropertiesEqual(a, b) {
    return (a === b) || (a.blocksLight === b.blocksLight
        && a.getLightLevel() === b.getLightLevel());
}
