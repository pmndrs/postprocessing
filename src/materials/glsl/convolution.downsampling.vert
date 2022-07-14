uniform vec2 texelSize;

varying vec2 vUv;
varying vec2 vUv00;
varying vec2 vUv01;
varying vec2 vUv02;
varying vec2 vUv03;
varying vec2 vUv04;
varying vec2 vUv05;
varying vec2 vUv06;
varying vec2 vUv07;
varying vec2 vUv08;
varying vec2 vUv09;
varying vec2 vUv10;
varying vec2 vUv11;

void main() {

	vUv = position.xy * 0.5 + 0.5;

	vUv00 = vUv + texelSize * vec2(-1.0, 1.0);
	vUv01 = vUv + texelSize * vec2(1.0, 1.0);
	vUv02 = vUv + texelSize * vec2(-1.0, -1.0);
	vUv03 = vUv + texelSize * vec2(1.0, -1.0);

	vUv04 = vUv + texelSize * vec2(-2.0, 2.0);
	vUv05 = vUv + texelSize * vec2(0.0, 2.0);
	vUv06 = vUv + texelSize * vec2(2.0, 2.0);
	vUv07 = vUv + texelSize * vec2(-2.0, 0.0);
	vUv08 = vUv + texelSize * vec2(2.0, 0.0);
	vUv09 = vUv + texelSize * vec2(-2.0, -2.0);
	vUv10 = vUv + texelSize * vec2(0.0, -2.0);
	vUv11 = vUv + texelSize * vec2(2.0, -2.0);

	gl_Position = vec4(position.xy, 1.0, 1.0);

}
