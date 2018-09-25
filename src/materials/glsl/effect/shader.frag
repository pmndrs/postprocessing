#include <common>
#include <packing>
#include <dithering_pars_fragment>

uniform sampler2D inputBuffer;
uniform sampler2D depthBuffer;

uniform vec2 resolution;
uniform vec2 texelSize;

uniform float cameraNear;
uniform float cameraFar;
uniform float aspect;
uniform float time;

varying vec2 vUv;

float readDepth(const in vec2 uv) {

	#if DEPTH_PACKING == 3201

		float depth = unpackRGBAToDepth(texture2D(depthBuffer, uv));

	#else

		float depth = texture2D(depthBuffer, uv).r;

	#endif

	#if defined(PERSPECTIVE_CAMERA) && !defined(USE_LOGDEPTHBUF)

		depth = viewZToOrthographicDepth(perspectiveDepthToViewZ(depth, cameraNear, cameraFar), cameraNear, cameraFar);

	#endif

	return depth;

}

FRAGMENT_HEAD

void main() {

	FRAGMENT_MAIN_UV

	vec4 color0 = texture2D(inputBuffer, UV);
	vec4 color1 = vec4(0.0);

	FRAGMENT_MAIN_IMAGE

	gl_FragColor = color0;

	#include <dithering_fragment>

}
