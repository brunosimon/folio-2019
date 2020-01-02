uniform sampler2D tShadow;
uniform vec3 uShadowColor;
uniform float uAlpha;

varying vec2 vUv;

void main()
{
    float shadowAlpha = 1.0 - texture2D(tShadow, vUv).r;
    shadowAlpha *= uAlpha;

    gl_FragColor = vec4(uShadowColor, shadowAlpha);
}
