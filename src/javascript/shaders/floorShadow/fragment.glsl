uniform sampler2D tShadow;
uniform vec3 uShadowColor;

varying vec2 vUv;

void main()
{
    float shadowAlpha = 1.0 - texture2D(tShadow, vUv).r;

    gl_FragColor = vec4(uShadowColor, shadowAlpha);
}
