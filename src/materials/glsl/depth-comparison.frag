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
	projTexCoord = clamp(projTexCoord, 0.002, 0.998);

	#if DEPTH_PACKING == 3201

		float fragCoordZ = unpackRGBAToDepth(texture2D(depthBuffer, projTexCoord));

	#else

		float fragCoordZ = texture2D(depthBuffer, projTexCoord).r;

	#endif

	#ifdef PERSPECTIVE_CAMERA

		float viewZ = perspectiveDepthToViewZ(fragCoordZ, cameraNear, cameraFar);

	#else

		float viewZ = orthographicDepthToViewZ(fragCoordZ, cameraNear, cameraFar);

	#endif

	float depthTest = (-vViewZ > -viewZ) ? 1.0 : 0.0;

	gl_FragColor.rg = vec2(0.0, depthTest);

}
