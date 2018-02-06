#include <packing>

uniform sampler2D tDepth;
uniform float cameraNear;
uniform float cameraFar;

varying vec4 vPosition;
varying vec4 vProjTexCoord;

void main() {

	// Transform into Cartesian coordinate (not mirrored).
	vec2 projTexCoord = (vProjTexCoord.xy / vProjTexCoord.w) * 0.5 + 0.5;
	projTexCoord = clamp(projTexCoord, 0.002, 0.998);

	float fragCoordZ = unpackRGBAToDepth(texture2D(tDepth, projTexCoord));
	float viewZ = -perspectiveDepthToViewZ(fragCoordZ, cameraNear, cameraFar);
	float depthTest = (-vPosition.z > viewZ) ? 1.0 : 0.0;

	gl_FragColor = vec4(0.0, depthTest, 1.0, 1.0);

}
