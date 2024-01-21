#include <pp_precision_fragment>

#include <common>
#include <colorspace_pars_fragment>
#include <dithering_pars_fragment>

#include <pp_colorspace_pars_fragment>
#include <pp_default_output_pars_fragment>
#include <pp_input_buffer_pars_fragment>

in vec2 vUv;

void main() {

	outputColor = texture(inputBuffer, vUv);

	#ifdef COLOR_SPACE_CONVERSION

		#include <colorspace_fragment>

	#endif

	#include <dithering_fragment>

}
