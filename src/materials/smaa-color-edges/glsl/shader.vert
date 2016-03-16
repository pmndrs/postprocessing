uniform vec2 texelSize;

varying vec2 vUv;
varying vec4 vOffset[3];

void main() {

	vUv = uv;

	vOffset[0] = uv.xyxy + texelSize.xyxy * vec4(-1.0, 0.0, 0.0, 1.0); // Changed sign in W component.
	vOffset[1] = uv.xyxy + texelSize.xyxy * vec4(1.0, 0.0, 0.0, -1.0); // Changed sign in W component.
	vOffset[2] = uv.xyxy + texelSize.xyxy * vec4(-2.0, 0.0, 0.0, 2.0); // Changed sign in W component.

	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

}
