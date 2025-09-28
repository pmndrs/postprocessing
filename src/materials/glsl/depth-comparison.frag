#include <packing>
#include <clipping_planes_pars_fragment>

#ifdef GL_FRAGMENT_PRECISION_HIGH

	uniform highp sampler2D depthBuffer;

#else

	uniform mediump sampler2D depthBuffer;

#endif

uniform float cameraNear;
uniform float cameraFar;

centroid varying float vViewZ;
centroid varying vec4 vProjTexCoord;

void main() {

	#include <clipping_planes_fragment>

	// Transform into Cartesian coordinates (not mirrored).
	vec2 projTexCoord = (vProjTexCoord.xy / vProjTexCoord.w) * 0.5 + 0.5;

	#if DEPTH_PACKING == 3201

		float depth = unpackRGBAToDepth(texture2D(depthBuffer, projTexCoord));

	#else

		float depth = texture2D(depthBuffer, projTexCoord).r;

	#endif

	#if defined(USE_LOGARITHMIC_DEPTH_BUFFER) || defined(LOG_DEPTH)

		float d = pow(2.0, depth * log2(cameraFar + 1.0)) - 1.0;
		float a = cameraFar / (cameraFar - cameraNear);
		float b = cameraFar * cameraNear / (cameraNear - cameraFar);
		depth = a + b / d;

	#elif defined(USE_REVERSED_DEPTH_BUFFER)

		depth = 1.0 - depth;

	#endif

	#ifdef PERSPECTIVE_CAMERA

		float viewZ = perspectiveDepthToViewZ(depth, cameraNear, cameraFar);

	#else

		float viewZ = orthographicDepthToViewZ(depth, cameraNear, cameraFar);

	#endif

	float depthTest = (-vViewZ > -viewZ) ? 1.0 : 0.0;

	gl_FragColor.rg = vec2(0.0, depthTest);

}
