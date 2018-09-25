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

#ifdef USE_LOGDEPTHBUF

	float readDepth(const in vec2 uv) {

		return texture2D(depthBuffer, uv).r;

	}

#else

	float readDepth(const in vec2 uv) {

		#ifdef DEPTH_PACKING

			float fragCoordZ = unpackRGBAToDepth(texture2D(depthBuffer, uv));

		#else

			float fragCoordZ = texture2D(depthBuffer, uv).r;

		#endif

		#ifdef PERSPECTIVE_CAMERA

			float depth = viewZToOrthographicDepth(perspectiveDepthToViewZ(fragCoordZ, cameraNear, cameraFar), cameraNear, cameraFar);

		#else

			float depth = orthographicDepthToViewZ(fragCoordZ, cameraNear, cameraFar);

		#endif

		return depth;

	}

#endif

FRAGMENT_HEAD

void main() {

	FRAGMENT_MAIN_UV

	vec4 color0 = texture2D(inputBuffer, UV);
	vec4 color1 = vec4(0.0);

	FRAGMENT_MAIN_IMAGE

	gl_FragColor = color0;

	#include <dithering_fragment>

}
