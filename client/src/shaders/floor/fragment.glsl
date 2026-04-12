varying vec2 vWorldPos;

void main()
{
    // World-space checkered grid — cells scroll as the car moves
    float cellSize = 3.0;
    vec2  cell     = floor(vWorldPos / cellSize);
    float check    = mod(cell.x + cell.y, 2.0);

    vec3 colorA = vec3(0.13, 0.13, 0.13);
    vec3 colorB = vec3(0.17, 0.17, 0.17);
    vec3 color  = mix(colorA, colorB, check);

    // Thin grid lines between cells
    vec2  cellFract = fract(vWorldPos / cellSize);
    float border    = 0.025;
    float line      = step(1.0 - border, cellFract.x) + step(1.0 - border, cellFract.y);
    line = clamp(line, 0.0, 1.0);
    color = mix(color, color * 0.65, line * 0.7);

    gl_FragColor = vec4(color, 1.0);
}
