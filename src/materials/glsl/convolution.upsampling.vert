uniform vec2 texelSize;

varying vec2 vUv;
varying vec2 vUv0;
varying vec2 vUv1;
varying vec2 vUv2;
varying vec2 vUv3;
varying vec2 vUv4;
varying vec2 vUv5;
varying vec2 vUv6;
varying vec2 vUv7;

void main() {

	vUv = position.xy * 0.5 + 0.5;

	vUv0 = vUv + texelSize * vec2(-1.0, 1.0);
	vUv1 = vUv + texelSize * vec2(0.0, 1.0);
	vUv2 = vUv + texelSize * vec2(1.0, 1.0);
	vUv3 = vUv + texelSize * vec2(-1.0, 0.0);

	vUv4 = vUv + texelSize * vec2(1.0, 0.0);
	vUv5 = vUv + texelSize * vec2(-1.0, -1.0);
	vUv6 = vUv + texelSize * vec2(0.0, -1.0);
	vUv7 = vUv + texelSize * vec2(1.0, -1.0);

	gl_Position = vec4(position.xy, 1.0, 1.0);

}
