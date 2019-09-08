uniform sampler2D uTexture;
uniform float uCount;
uniform float uProgress;

varying vec2 vUv;

void main()
{
    vec2 newUV = vUv;
    newUV.x = newUV.x / uCount * 2.0;
    newUV.x += uProgress;

    vec4 textureColor = texture2D(uTexture, newUV);

    if(!gl_FrontFacing)
    {
        textureColor *= 0.5;
    }

    gl_FragColor = vec4(textureColor.rgb, 1.0);
}
