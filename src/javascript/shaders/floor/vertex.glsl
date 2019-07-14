varying vec2 vUv;
varying vec2 vScreenPosition;

void main()
{
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    vScreenPosition = gl_Position.xy / gl_Position.w;
}
