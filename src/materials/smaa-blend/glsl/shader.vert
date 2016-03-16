uniform vec2 texelSize;

varying vec2 vUv;
varying vec4 vOffset;

void main() {

	vUv = uv;

	vOffset = uv.xyxy + texelSize.xyxy * vec4(1.0, 0.0, 0.0, -1.0); // Changed sign in W component.

	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

}
