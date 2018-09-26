uniform sampler2D edgeTexture;
uniform sampler2D maskTexture;

uniform vec3 visibleEdgeColor;
uniform vec3 hiddenEdgeColor;
uniform float pulse;
uniform float edgeStrength;

#ifdef USE_PATTERN

	uniform sampler2D patternTexture;
	varying vec2 vUvPattern;

#endif

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	vec2 edge = texture2D(edgeTexture, uv).rg;
	vec2 mask = texture2D(maskTexture, uv).rg;

	#ifndef X_RAY

		edge.y = 0.0;

	#endif

	edge *= (edgeStrength * mask.x * pulse);
	vec3 color = edge.x * visibleEdgeColor + edge.y * hiddenEdgeColor;

	float visibilityFactor = 0.0;

	#ifdef USE_PATTERN

		vec4 patternColor = texture2D(patternTexture, vUvPattern);

		#ifdef X_RAY

			float hiddenFactor = 0.5;

		#else

			float hiddenFactor = 0.0;

		#endif

		visibilityFactor = (1.0 - mask.y > 0.0) ? 1.0 : hiddenFactor;
		visibilityFactor *= (1.0 - mask.x) * patternColor.a;
		color += visibilityFactor * patternColor.rgb;

	#endif

	outputColor = vec4(color, max(max(edge.x, edge.y), visibilityFactor));

}
