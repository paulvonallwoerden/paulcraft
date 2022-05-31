import { ShaderMaterial } from 'three';
export var vertexShader = "\n    attribute float skyLight;\n    attribute float blockLight;\n    attribute float foliage;\n\n    varying float fLightLevel;\n    varying vec4 fFoliageColor;\n\n    varying vec2 vUv;\n    varying vec3 vNormal;\n\n    uniform float fAmbientLightLevel;\n    uniform float fSkyLightFactor;\n\n    void main() {\n        vUv = uv;\n        vNormal = normal;\n\n        fLightLevel = fAmbientLightLevel;\n\n        float fFaceFactor = max(0.0, dot(vNormal, vec3(0.0, 1.0, 0.0))) * 0.4 + 0.6;\n        float fNormalizedSkyLight = (skyLight / 15.0) * fSkyLightFactor * fFaceFactor;\n        float fNormalizedBlockLight = (blockLight / 15.0);\n        fLightLevel += max(fNormalizedBlockLight, fNormalizedSkyLight) * (1.0 - fAmbientLightLevel);\n\n        fFoliageColor = foliage * vec4(40.0 / 255.0, 110.0 / 255.0, 38.0 / 255.0, 1.0) + (1.0 - foliage) * vec4(1.0, 1.0, 1.0, 1.0);\n\n        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);\n    }\n";
export var fragmentShader = "\n    uniform sampler2D uTexture;\n\n    varying vec2 vUv;\n    varying vec3 vNormal;\n\n    varying float fLightLevel;\n    varying vec4 fFoliageColor;\n\n    void main() {\n        vec4 color = texture2D(uTexture, vUv) * fFoliageColor;\n        gl_FragColor = color * vec4(fLightLevel, fLightLevel, fLightLevel, 1.0);\n    }\n";
export function makeOpaqueBlockMaterial(map) {
    return new ShaderMaterial({
        uniforms: {
            uTexture: { value: map },
            fAmbientLightLevel: { value: 0.15 },
            fSkyLightFactor: { value: 1.0 },
        },
        fragmentShader: fragmentShader,
        vertexShader: vertexShader,
        transparent: true,
    });
}
