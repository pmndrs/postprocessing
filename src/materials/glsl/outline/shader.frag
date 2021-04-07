uniform lowp sampler2D inputBuffer;

varying vec2 vUv0;
varying vec2 vUv1;
varying vec2 vUv2;
varying vec2 vUv3;

void main() {

	vec2 c0 = texture2D(inputBuffer, vUv0).rg;
	vec2 c1 = texture2D(inputBuffer, vUv1).rg;
	vec2 c2 = texture2D(inputBuffer, vUv2).rg;
	vec2 c3 = texture2D(inputBuffer, vUv3).rg;

	float d0 = (c0.x - c1.x) * 0.5;
	float d1 = (c2.x - c3.x) * 0.5;
	float d = length(vec2(d0, d1));

	float a0 = min(c0.y, c1.y);
	float a1 = min(c2.y, c3.y);
	float visibilityFactor = min(a0, a1);

	gl_FragColor.rg = (1.0 - visibilityFactor > 0.001) ? vec2(d, 0.0) : vec2(0.0, d);

}
