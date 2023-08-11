uniform vec4 texelSize; // XY = texel size, ZW = half texel size
uniform float kernel;
uniform float scale;
uniform float aspect;
uniform vec2 rotation;

varying vec2 vUv;
varying vec2 vUv2;
varying vec2 vOffset;

void main() {

	vec2 uv = position.xy * 0.5 + 0.5;

	vUv = uv;
	vUv2 = (uv - 0.5) * 2.0 * vec2(aspect, 1.0);
	vUv2 = vec2(dot(rotation, vUv2), dot(rotation, vec2(vUv2.y, -vUv2.x)));
	vOffset = (texelSize.xy * vec2(kernel) + texelSize.zw) * scale;

	gl_Position = vec4(position.xy, 1.0, 1.0);

}
