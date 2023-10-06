#include <pp_output_pars_fragment>
#include <packing>

#define packFloatToRGBA(v) packDepthToRGBA(v)
#define unpackRGBAToFloat(v) unpackRGBAToDepth(v)

uniform lowp sampler2D luminanceBuffer0;
uniform lowp sampler2D luminanceBuffer1;

uniform float minLuminance;
uniform float deltaTime;
uniform float tau;

in vec2 vUv;

void main() {

	// This 1x1 buffer contains the previous luminance.
	float l0 = unpackRGBAToFloat(texture2D(luminanceBuffer0, vUv));

	// Get the current average scene luminance.
	float l1 = textureLod(luminanceBuffer1, vUv, MIP_LEVEL_1X1).r;

	l0 = max(minLuminance, l0);
	l1 = max(minLuminance, l1);

	// Adapt the luminance using Pattanaik's technique.
	float adaptedLum = l0 + (l1 - l0) * (1.0 - exp(-deltaTime * tau));
	outputColor = (adaptedLum == 1.0) ? vec4(1.0) : packFloatToRGBA(adaptedLum);

}
