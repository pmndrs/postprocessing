#include <packing>
#include <clipping_planes_pars_fragment>

uniform sampler2D depthBuffer;
uniform float cameraNear;
uniform float cameraFar;

varying float vViewZ;
varying vec4 vProjTexCoord;

void main() {

	#include <clipping_planes_fragment>

	// Transform into Cartesian coordinate (not mirrored).
	vec2 projTexCoord = (vProjTexCoord.xy / vProjTexCoord.w) * 0.5 + 0.5;
	projTexCoord = clamp(projTexCoord, 0.002, 0.998);

	float fragCoordZ = unpackRGBAToDepth(texture2D(depthBuffer, projTexCoord));

	#ifdef PERSPECTIVE_CAMERA

		float viewZ = perspectiveDepthToViewZ(fragCoordZ, cameraNear, cameraFar);

	#else

		float viewZ = orthographicDepthToViewZ(fragCoordZ, cameraNear, cameraFar);

	#endif

	float depthTest = (-vViewZ > -viewZ) ? 1.0 : 0.0;

	gl_FragColor.rgb = vec3(0.0, depthTest, 1.0);

}
