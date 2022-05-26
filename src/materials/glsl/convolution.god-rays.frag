#include <common>
#include <dithering_pars_fragment>

#ifdef FRAMEBUFFER_PRECISION_HIGH

	uniform mediump sampler2D inputBuffer;

#else

	uniform lowp sampler2D inputBuffer;

#endif

uniform vec2 lightPosition;
uniform float exposure;
uniform float decay;
uniform float density;
uniform float weight;
uniform float clampMax;

varying vec2 vUv;

void main() {

	vec2 coord = vUv;

	// Calculate the vector from this pixel to the light position in screen space.
	vec2 delta = lightPosition - coord;
	delta *= 1.0 / SAMPLES_FLOAT * density;

	// A decreasing illumination factor.
	float illuminationDecay = 1.0;
	vec4 color = vec4(0.0);

	// Estimate the probability of occlusion at each pixel by summing samples along a ray to the light position.
	for(int i = 0; i < SAMPLES_INT; ++i) {

		coord += delta;
		vec4 texel = texture2D(inputBuffer, coord);

		// Apply the sample attenuation scale/decay factors.
		texel *= illuminationDecay * weight;
		color += texel;

		// Update the exponential decay factor.
		illuminationDecay *= decay;

	}

	gl_FragColor = clamp(color * exposure, 0.0, clampMax);

	#include <dithering_fragment>

}
