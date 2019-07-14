uniform sampler2D tDiffuse;
uniform sampler2D tStroke;
uniform vec3 uPencilColor;
uniform float uVignetteStrength;
uniform float uVignetteOffset;
uniform float uNoiseStrength;

varying vec2 vUv;

#pragma glslify: random = require(../partials/random.glsl)
#pragma glslify: easeSin = require(../partials/ease-sin.glsl)

void main()
{
    // Base
    vec3 diffuseColor = texture2D(tDiffuse, vUv).rgb;

    // Strokes
    float strokeStrength = texture2D(tStroke, vUv).r;
    diffuseColor = mix(diffuseColor, uPencilColor, strokeStrength);

    // Noise
    diffuseColor += (random(vUv) - 0.5) * uNoiseStrength;

    // Vignette
    float vignetteStrength = distance(vUv, vec2(0.5, 0.5));
    vignetteStrength *= uVignetteStrength;
    vignetteStrength += uVignetteOffset;
    vignetteStrength = min(max(vignetteStrength, 0.0), 1.0);
    vignetteStrength = easeSin(vignetteStrength);
    // vignetteStrength = smoothstep(0.0, 1.0, vignetteStrength);
    diffuseColor = mix(diffuseColor, uPencilColor, vignetteStrength);

    // Final
    gl_FragColor = vec4(diffuseColor, 1.0);
}
