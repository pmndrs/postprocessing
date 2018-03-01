uniform sampler2D tDiffuse;
uniform sampler2D tMask;
uniform sampler2D tEdges;

uniform vec3 visibleEdgeColor;
uniform vec3 hiddenEdgeColor;
uniform float pulse;
uniform float edgeStrength;

#ifdef USE_PATTERN

	uniform sampler2D tPattern;
	varying vec2 vPatternCoord;

#endif

varying vec2 vUv;

void main() {

	vec4 color = texture2D(tDiffuse, vUv);
	vec2 edge = texture2D(tEdges, vUv).rg;
	vec2 mask = texture2D(tMask, vUv).rg;

	#ifndef X_RAY

		edge.y = 0.0;

	#endif

	edge *= (edgeStrength * mask.x * pulse);
	vec3 outlineColor = edge.x * visibleEdgeColor + edge.y * hiddenEdgeColor;

	#ifdef ALPHA_BLENDING

		color.rgb = mix(color.rgb, outlineColor, max(edge.x, edge.y));

	#else

		color.rgb += outlineColor;

	#endif

	#ifdef USE_PATTERN

		vec3 patternColor = texture2D(tPattern, vPatternCoord).rgb;

		#ifdef X_RAY

			float hiddenFactor = 0.5;

		#else

			float hiddenFactor = 0.0;

		#endif

		float visibilityFactor = (1.0 - mask.y > 0.0) ? 1.0 : hiddenFactor;

		color.rgb += visibilityFactor * (1.0 - mask.x) * (1.0 - patternColor);

	#endif

	gl_FragColor = color;

}
