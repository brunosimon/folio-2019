uniform sampler2D uTexture;
uniform vec3 uColor;
uniform float uTextureAlpha;

varying vec2 vUv;

void main()
{
    vec4 textureColor = texture2D(uTexture, vUv);

    gl_FragColor = mix(vec4(uColor, 1.0), textureColor, uTextureAlpha);
}
