import { ShaderMaterial, Texture } from 'three';

export const vertexShader = `
    attribute vec2 vPos;
    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

export const fragmentShader = `
    uniform sampler2D uTexture;

    varying vec2 vUv;

    void main() {
        gl_FragColor = texture2D(uTexture, vUv);
    }
`;

export function makeTextMaterial(map?: Texture) {
    return new ShaderMaterial({
        uniforms: {
            uTexture: { value: map },
        },
        fragmentShader,
        vertexShader,
        transparent: true,
    });
}
