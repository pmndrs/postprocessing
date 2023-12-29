#include <pp_precision_fragment>
#include <pp_gbuffer_output_pars_fragment>
#include <pp_colorspace_pars_fragment>
#include <pp_input_buffer_pars_fragment>

#include <common>
#include <colorspace_pars_fragment>
#include <dithering_pars_fragment>

in vec2 vUv;

void main() {

	outputColor = texture(inputBuffer, vUv);

	#include <colorspace_fragment>
	#include <dithering_fragment>

}
