import * as THREE from 'three'

export default function()
{
    return new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.DoubleSide,
        // blending: THREE.AdditiveBlending,
        uniforms:
        {
            uTexture: { type: 't', value: null },

            uFadeDistance: { type: 'f', value: 4 },
            uFadeAmplitude: { type: 'f', value: 1 },

            uContainerPosition: { type: 'v3', value: new THREE.Vector3() },
            uAlpha: { type: 'f', value: 1 },

            uColorStart: { type: 'vec3', value: new THREE.Color(0x4f83a7) }, // 0xc8a08a | 0x4f83a7 | 0x722151
            uColorEnd: { type: 'vec3', value: new THREE.Color(0xeefbff) } // 0xfffaee | 0xeefbff | 0xffffd0
        },
        vertexShader: `
            uniform float uFadeDistance;
            uniform float uFadeAmplitude;
            uniform vec3 uContainerPosition;
            uniform float uAlpha;

            varying vec2 vUv;
            varying float vAlpha;

            void main()
            {
                vUv = uv;

                vec4 modelPosition = modelMatrix * vec4(position, 1.0);
                vAlpha = clamp((uFadeDistance - abs(modelPosition.x - uContainerPosition.x)) / uFadeAmplitude, 0.0, 1.0);
                vAlpha *= uAlpha;
                gl_Position = projectionMatrix * viewMatrix * modelPosition;
            }
        `,
        fragmentShader: `
            uniform sampler2D uTexture;
            uniform vec3 uColorStart;
            uniform vec3 uColorEnd;

            varying vec2 vUv;
            varying float vAlpha;

            void main()
            {
                vec4 textureColor = texture2D(uTexture, vUv);
                float alpha = textureColor.r * vAlpha;
                gl_FragColor = vec4(uColorEnd, alpha);
            }
        `
    })
}
