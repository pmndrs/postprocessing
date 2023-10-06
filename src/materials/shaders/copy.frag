#include <pp_precision_fragment>
#include <pp_output_pars_fragment>

#include <common>
#include <colorspace_pars_fragment>
#include <dithering_pars_fragment>

#ifdef FRAMEBUFFER_PRECISION_HIGH

	uniform mediump sampler2D inputBuffer;

#else

	uniform lowp sampler2D inputBuffer;

#endif

in vec2 vUv;

void main() {

	outputColor = texture(inputBuffer, vUv);

	#include <colorspace_fragment>
	#include <dithering_fragment>

}
