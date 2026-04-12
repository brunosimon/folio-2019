varying vec2 vWorldPos;

void main()
{
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
