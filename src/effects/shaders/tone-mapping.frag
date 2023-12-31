#include <tonemapping_pars_fragment>

vec4 mainImage(const in vec4 inputColor, const in vec2 uv, const in GData gData) {

	return vec4(toneMapping(inputColor.rgb), inputColor.a);

}
