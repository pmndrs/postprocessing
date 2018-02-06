uniform sampler2D tDiffuse;
uniform sampler2D tMask;
uniform sampler2D tEdges;

uniform float edgeStrength;

#ifdef USE_PATTERN

	uniform sampler2D tPattern;
	varying vec2 vPatternCoord;

#endif

varying vec2 vUv;

void main() {

	vec4 color = texture2D(tDiffuse, vUv);
	vec4 edgeColor = texture2D(tEdges, vUv);
	vec4 maskColor = texture2D(tMask, vUv);

	float visibilityFactor = ((1.0 - maskColor.g) > 0.0) ? 1.0 : 0.5;

	color += edgeStrength * maskColor.r * edgeColor;

	#ifdef USE_PATTERN

		vec4 patternColor = texture2D(tPattern, vPatternCoord);
		color += visibilityFactor * (1.0 - maskColor.r) * (1.0 - patternColor.r);

	#endif

	gl_FragColor = color;

}
