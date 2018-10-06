uniform vec2 texelSize;

varying vec2 vUv;

varying vec2 vUv0;
varying vec2 vUv1;
varying vec2 vUv2;
varying vec2 vUv3;
varying vec2 vUv4;
varying vec2 vUv5;

void main() {

	vUv = uv;

	// Left and top texel coordinates.
	vUv0 = uv + texelSize * vec2(-1.0, 0.0);
	vUv1 = uv + texelSize * vec2(0.0, 1.0);

	// Right and bottom texel coordinates.
	vUv2 = uv + texelSize * vec2(1.0, 0.0);
	vUv3 = uv + texelSize * vec2(0.0, -1.0);

	// Left-left and top-top texel coordinates.
	vUv4 = uv + texelSize * vec2(-2.0, 0.0);
	vUv5 = uv + texelSize * vec2(0.0, 2.0);

	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

}
