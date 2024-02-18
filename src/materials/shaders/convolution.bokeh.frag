#include <pp_precision_fragment>
#include <pp_default_output_pars_fragment>
#include <pp_input_buffer_pars_fragment>
#include <pp_resolution_pars_fragment>

#if PASS == 1

	uniform vec4 kernel64[32];

#else

	uniform vec4 kernel16[8];

#endif

uniform lowp sampler2D cocBuffer;
uniform float scale;

in vec2 vUv;

void main() {

	#ifdef FOREGROUND

		vec2 cocNearFar = texture(cocBuffer, vUv).rg * scale;
		float coc = cocNearFar.x;

	#else

		float coc = texture(cocBuffer, vUv).g * scale;

	#endif

	if(coc == 0.0) {

		// Skip blurring.
		out_Color = texture(inputBuffer, vUv);

	} else {

		#ifdef FOREGROUND

			// Use far CoC to avoid weak blurring around foreground objects.
			vec2 step = resolution.zw * max(cocNearFar.x, cocNearFar.y);

		#else

			vec2 step = resolution.zw * coc;

		#endif

		#if PASS == 1

			vec4 acc = vec4(0.0);

			// Each vector contains two sampling points (64 in total).
			for(int i = 0; i < 32; ++i) {

				vec4 kernel = kernel64[i];

				vec2 uv = step * kernel.xy + vUv;
				acc += texture(inputBuffer, uv);

				uv = step * kernel.zw + vUv;
				acc += texture(inputBuffer, uv);

			}

			out_Color = acc / 64.0;

		#else

			vec4 maxValue = texture(inputBuffer, vUv);

			// Each vector contains two sampling points (16 in total).
			for(int i = 0; i < 8; ++i) {

				vec4 kernel = kernel16[i];

				vec2 uv = step * kernel.xy + vUv;
				maxValue = max(texture(inputBuffer, uv), maxValue);

				uv = step * kernel.zw + vUv;
				maxValue = max(texture(inputBuffer, uv), maxValue);


			}

			out_Color = maxValue;

		#endif

	}

}
