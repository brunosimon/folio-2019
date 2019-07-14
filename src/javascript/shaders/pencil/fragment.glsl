#define TOTO
#define PHONG

uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;

#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

// Custom start
uniform sampler2D tPerlin;
uniform vec3 uPencilColor;
uniform vec3 uPaperColor;
uniform float uSubdivision;
uniform float uStrokeUvDim;
uniform float uStrokeSmoothDepthAmplitude;
uniform float uStrokeSmoothDepthOffset;
uniform float uStrokeSmoothDepthMin;
uniform float uStrokeSmoothDepthMax;
uniform float uStrokeLightOffset;
uniform float uStrokeLightMultiplier;

varying vec3 vWorldPosition;
varying vec3 vObjectNormal;
varying vec3 vObjectTangent;
varying vec2 vUv;
varying float vDepth;

#pragma glslify: random = require(../partials/random.glsl)
#pragma glslify: round = require(../partials/round.glsl)

float getPencilStrengthSpicks(float _strength, vec3 _position, vec3 _normal, vec3 _tangent, vec2 _uv, float _depth)
{
    vec2 uv = _uv;
    vec3 roundedTangeant = floor(_tangent * 2.0 + 0.5) / 2.0 - 0.5;
    // vec3 roundedTangeant = _tangent;

    vec3 farPoint = roundedTangeant * 100.0;
    float distanceToFarPoint = distance(_position, farPoint);

    // Dim with uv Y
    float uvDim = (1.0 - (1.0 - _uv.y) * uStrokeUvDim);

    // Base stroke pattern
    float baseStrokeStrength = distance(distanceToFarPoint, round(distanceToFarPoint * uSubdivision) / uSubdivision) * uSubdivision * 2.0;

    // Light strength
    float lightStrength = _strength;
    lightStrength += uStrokeLightOffset;
    lightStrength *= uStrokeLightMultiplier;

    // Smoothness
    float smoothness = (_depth + uStrokeSmoothDepthOffset) * uStrokeSmoothDepthAmplitude;
    smoothness = max(min(smoothness, uStrokeSmoothDepthMax), uStrokeSmoothDepthMin);

    // Final strength
    float strength = smoothstep(max(baseStrokeStrength - smoothness, 0.0), min(baseStrokeStrength + smoothness, 1.0), lightStrength / uvDim);

    // return _depth;
    return strength;
}
// Custom end

void main()
{
    #include <clipping_planes_fragment>

    vec4 diffuseColor = vec4(diffuse, opacity);
    ReflectedLight reflectedLight = ReflectedLight(vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));
    vec3 totalEmissiveRadiance = emissive;

    #include <logdepthbuf_fragment>
    #include <map_fragment>
    #include <color_fragment>
    #include <alphamap_fragment>
    #include <alphatest_fragment>
    #include <specularmap_fragment>
    #include <normal_fragment_begin>
    #include <normal_fragment_maps>
    #include <emissivemap_fragment>

    // accumulation
    #include <lights_phong_fragment>
    #include <lights_fragment_begin>
    #include <lights_fragment_maps>
    #include <lights_fragment_end>

    // modulation
    #include <aomap_fragment>

    vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;

    // Custom start
    // vec3 uPencilColor = vec3(0.25, 0.25, 0.25);
    // vec3 uPaperColor = vec3(1.0, 1.0, 1.0);
    float baseIntensity = outgoingLight.r;

    float pencilIntensity = baseIntensity;

    // if(pencilIntensity <= 0.1)
    // {
    //     pencilIntensity = 0.0;
    // }
    // else if(pencilIntensity > 0.1 && pencilIntensity <= 0.8)
    // {
    //     pencilIntensity = getPencilStrengthSpicks(pencilIntensity / 0.7 - 0.1, vWorldPosition, vObjectNormal, vObjectTangent, vUv);
    // }
    // else if(pencilIntensity > 0.8)
    // {
    //     pencilIntensity = 1.0;
    // }

    pencilIntensity = getPencilStrengthSpicks(pencilIntensity, vWorldPosition, vObjectNormal, vObjectTangent, vUv, vDepth);

    // pencilIntensity += abs(random(vUv * 1234.0)) * 0.2;

    vec3 color = mix(uPencilColor, uPaperColor, pencilIntensity);

    gl_FragColor = vec4(color, diffuseColor.a);
    // gl_FragColor = vec4(vUv, 1.0, diffuseColor.a);
    // Custom end

    #include <tonemapping_fragment>
    #include <encodings_fragment>
    #include <fog_fragment>
    #include <premultiplied_alpha_fragment>
    #include <dithering_fragment>
}
