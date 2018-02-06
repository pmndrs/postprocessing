uniform sampler2D tMask;
uniform vec3 visibleEdgeColor;
uniform vec3 hiddenEdgeColor;

varying vec2 vUv0;
varying vec2 vUv1;
varying vec2 vUv2;
varying vec2 vUv3;

void main() {

	vec4 c0 = texture2D(tMask, vUv0);
	vec4 c1 = texture2D(tMask, vUv1);
	vec4 c2 = texture2D(tMask, vUv2);
	vec4 c3 = texture2D(tMask, vUv3);

	float d0 = (c0.r - c1.r) * 0.5;
	float d1 = (c2.r - c3.r) * 0.5;
	float d = length(vec2(d0, d1));

	float a0 = min(c0.g, c1.g);
	float a1 = min(c2.g, c3.g);
	float visibilityFactor = min(a0, a1);

	vec3 edgeColor = (1.0 - visibilityFactor > 0.001) ? visibleEdgeColor : hiddenEdgeColor;

	gl_FragColor = vec4(edgeColor * d, d);

}
