uniform vec2 uImageIncrement;

varying vec2 vUv;

void main() {

	vUv = uv - ((KERNEL_SIZE_FLOAT - 1.0) / 2.0) * uImageIncrement;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

}
