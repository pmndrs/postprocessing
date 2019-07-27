uniform vec2 texelSize;
uniform vec2 halfTexelSize;
uniform float kernel;
uniform float scale;

/* Packing multiple texture coordinates into one varying and using a swizzle to
extract them in the fragment shader still causes a dependent texture read. */
varying vec2 vUv0;
varying vec2 vUv1;
varying vec2 vUv2;
varying vec2 vUv3;

void main() {

	vec2 uv = position.xy * 0.5 + 0.5;
	vec2 dUv = (texelSize * vec2(kernel) + halfTexelSize) * scale;

	vUv0 = vec2(uv.x - dUv.x, uv.y + dUv.y);
	vUv1 = vec2(uv.x + dUv.x, uv.y + dUv.y);
	vUv2 = vec2(uv.x + dUv.x, uv.y - dUv.y);
	vUv3 = vec2(uv.x - dUv.x, uv.y - dUv.y);

	gl_Position = vec4(position.xy, 1.0, 1.0);

}
