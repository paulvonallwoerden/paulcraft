import { ShaderMaterial, Texture } from 'three';

export const vertexShader = `
    attribute float skyLight;
    attribute float blockLight;
    attribute float foliage;

    varying float fLightLevel;
    varying vec4 fFoliageColor;

    varying vec2 vUv;
    varying vec3 vNormal;

    uniform float fAmbientLightLevel;
    uniform float fSkyLightFactor;

    void main() {
        vUv = uv;
        vNormal = normal;

        fLightLevel = fAmbientLightLevel;

        float fFaceFactor = max(0.0, dot(vNormal, vec3(0.0, 1.0, 0.0))) * 0.4 + 0.6;
        float fNormalizedSkyLight = (skyLight / 15.0) * fSkyLightFactor * fFaceFactor;
        float fNormalizedBlockLight = (blockLight / 15.0);
        fLightLevel += max(fNormalizedBlockLight, fNormalizedSkyLight) * (1.0 - fAmbientLightLevel);

        fFoliageColor = foliage * vec4(40.0 / 255.0, 110.0 / 255.0, 38.0 / 255.0, 1.0) + (1.0 - foliage) * vec4(1.0, 1.0, 1.0, 1.0);

        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
    }
`;

export const fragmentShader = `
    uniform sampler2D uTexture;

    varying vec2 vUv;
    varying vec3 vNormal;

    varying float fLightLevel;
    varying vec4 fFoliageColor;

    void main() {
        vec4 color = texture2D(uTexture, vUv) * fFoliageColor;
        gl_FragColor = color * vec4(fLightLevel, fLightLevel, fLightLevel, 1.0);
    }
`;

export function makeOpaqueBlockMaterial(map: Texture) {
    return new ShaderMaterial({
        uniforms: {
            uTexture: { value: map },
            fAmbientLightLevel: { value: 0.15 },
            fSkyLightFactor: { value: 1.0 },
        },
        fragmentShader,
        vertexShader,
        alphaTest: 0.5,
        transparent: true,
    });
}
