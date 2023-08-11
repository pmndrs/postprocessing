varying vec2 vUv;

#ifdef NORMAL_DEPTH

	#ifdef GL_FRAGMENT_PRECISION_HIGH

		uniform highp sampler2D normalDepthBuffer;

	#else

		uniform mediump sampler2D normalDepthBuffer;

	#endif

	#define getDepth(uv) texture2D(normalDepthBuffer, uv).a

#else

	#ifdef GL_FRAGMENT_PRECISION_HIGH

		uniform highp sampler2D depthBuffer;

	#else

		uniform mediump sampler2D depthBuffer;

	#endif

	#define getDepth(uv) texture2D(depthBuffer, uv).r

#endif

void main() {

	gl_FragColor = vec4(getDepth(vUv));

}
