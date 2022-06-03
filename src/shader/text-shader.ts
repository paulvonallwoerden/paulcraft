import { ShaderMaterial, Texture } from 'three';

export const vertexShader = `
    attribute vec2 vPos;
    attribute vec4 color;

    varying vec2 vUv;
    varying vec4 vColor;

    void main() {
        vUv = uv;
        vColor = color;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

export const fragmentShader = `
    uniform sampler2D uTexture;

    varying vec2 vUv;
    varying vec4 vColor;

    void main() {
        gl_FragColor = texture2D(uTexture, vUv) * vColor;
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
