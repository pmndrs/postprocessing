#include <pp_default_output_pars_fragment>

in vec2 vUv;

#ifdef NORMAL_DEPTH

	#ifdef GL_FRAGMENT_PRECISION_HIGH

		uniform highp sampler2D normalDepthBuffer;

	#else

		uniform mediump sampler2D normalDepthBuffer;

	#endif

	#define getDepth(uv) texture(normalDepthBuffer, uv).a

#else

	#include <pp_depth_buffer_pars_fragment>
	#define getDepth(uv) texture(depthBuffer, uv).r

#endif

void main() {

	out_Color = vec4(getDepth(vUv));

}
