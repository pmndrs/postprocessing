varying float vViewZ;
varying vec4 vProjTexCoord;

void main() {

	vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
	vProjTexCoord = projectionMatrix * mvPosition;
	vViewZ = mvPosition.z;

	gl_Position = vProjTexCoord;

}
