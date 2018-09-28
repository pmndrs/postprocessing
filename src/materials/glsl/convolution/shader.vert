uniform vec2 texelSize;
uniform vec2 halfTexelSize;
uniform float kernel;

/* Packing multiple texture coordinates into one varying and using a swizzle to
extract them in the fragment shader still causes a dependent texture read. */
varying vec2 vUv0;
varying vec2 vUv1;
varying vec2 vUv2;
varying vec2 vUv3;

void main() {

	vec2 dUv = (texelSize * vec2(kernel)) + halfTexelSize;

	vUv0 = vec2(uv.x - dUv.x, uv.y + dUv.y);
	vUv1 = vec2(uv.x + dUv.x, uv.y + dUv.y);
	vUv2 = vec2(uv.x + dUv.x, uv.y - dUv.y);
	vUv3 = vec2(uv.x - dUv.x, uv.y - dUv.y);

	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

}
