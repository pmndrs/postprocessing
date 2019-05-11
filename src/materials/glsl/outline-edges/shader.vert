uniform vec2 texelSize;

varying vec2 vUv0;
varying vec2 vUv1;
varying vec2 vUv2;
varying vec2 vUv3;

void main() {

	vec2 uv = position.xy * 0.5 + 0.5;

	vUv0 = vec2(uv.x + texelSize.x, uv.y);
	vUv1 = vec2(uv.x - texelSize.x, uv.y);
	vUv2 = vec2(uv.x, uv.y + texelSize.y);
	vUv3 = vec2(uv.x, uv.y - texelSize.y);

	gl_Position = vec4(position.xy, 1.0, 1.0);

}
