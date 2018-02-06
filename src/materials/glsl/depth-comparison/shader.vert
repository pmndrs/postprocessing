varying vec4 vPosition;
varying vec4 vProjTexCoord;

void main() {

	vPosition = modelViewMatrix * vec4(position, 1.0);
	vProjTexCoord = projectionMatrix * vPosition;

	gl_Position = vProjTexCoord;

}
