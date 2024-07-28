#include <pp_default_output_pars_fragment>
#include <pp_input_buffer_pars_fragment>

#ifdef USE_SUPPORT_BUFFER

	#ifdef FRAMEBUFFER_PRECISION_HIGH

		uniform mediump sampler2D supportBuffer;

	#else

		uniform lowp sampler2D supportBuffer;

	#endif

	uniform float radius;

#endif

in vec2 vUv;
in vec2 vUv0, vUv1, vUv2, vUv3;
in vec2 vUv4, vUv5, vUv6, vUv7;

void main() {

	vec4 c = vec4(0.0);
	c += texture(inputBuffer, vUv0) * 0.0625;
	c += texture(inputBuffer, vUv1) * 0.125;
	c += texture(inputBuffer, vUv2) * 0.0625;
	c += texture(inputBuffer, vUv3) * 0.125;
	c += texture(inputBuffer, vUv) * 0.25;
	c += texture(inputBuffer, vUv4) * 0.125;
	c += texture(inputBuffer, vUv5) * 0.0625;
	c += texture(inputBuffer, vUv6) * 0.125;
	c += texture(inputBuffer, vUv7) * 0.0625;

	#ifdef USE_SUPPORT_BUFFER

		vec4 baseColor = texture(supportBuffer, vUv);
		out_Color = mix(baseColor, c, radius);

	#else

		out_Color = c;

	#endif

}
