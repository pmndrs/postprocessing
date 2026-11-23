uniform vec2 texelSize;

varying vec2 vCenterUv1;
varying vec2 vCenterUv2;
varying vec2 vCenterUv3;
varying vec2 vCenterUv4;
varying vec2 vRowUv1;
varying vec2 vRowUv2;
varying vec2 vRowUv3;
varying vec2 vRowUv4;
varying vec2 vRowUv5;
varying vec2 vRowUv6;
varying vec2 vRowUv7;
varying vec2 vRowUv8;
varying vec2 vRowUv9;

void main() {

	vec2 uv = position.xy * 0.5 + 0.5;

	vCenterUv1 = uv + texelSize * vec2(-1.0, 1.0);
	vCenterUv2 = uv + texelSize;
	vCenterUv3 = uv + texelSize * vec2(-1.0);
	vCenterUv4 = uv + texelSize * vec2(1.0, -1.0);

	vRowUv1 = uv + texelSize * vec2(-2.0, 2.0);
	vRowUv2 = uv + texelSize * vec2(0.0, 2.0);
	vRowUv3 = uv + texelSize * vec2(2.0);
	vRowUv4 = uv + texelSize * vec2(-2.0, 0.0);
	vRowUv5 = uv + texelSize;
	vRowUv6 = uv + texelSize * vec2(2.0, 0.0);
	vRowUv7 = uv + texelSize * vec2(-2.0);
	vRowUv8 = uv + texelSize * vec2(0.0, -2.0);
	vRowUv9 = uv + texelSize * vec2(2.0, -2.0);

	gl_Position = vec4(position.xy, 1.0, 1.0);

}
