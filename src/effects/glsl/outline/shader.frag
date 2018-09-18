uniform sampler2D maskTexture;
uniform sampler2D edgeTexture;
uniform sampler2D patternTexture;

uniform vec3 visibleEdgeColor;
uniform vec3 hiddenEdgeColor;
uniform float pulse;
uniform float edgeStrength;

varying vec2 vUvPattern;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	vec2 edge = texture2D(edgeTexture, uv).rg;
	vec2 mask = texture2D(maskTexture, uv).rg;

	#ifndef X_RAY

		edge.y = 0.0;

	#endif

	edge *= (edgeStrength * mask.x * pulse);
	vec3 outlineColor = edge.x * visibleEdgeColor + edge.y * hiddenEdgeColor;

	vec3 color = outlineColor;

	#ifdef USE_PATTERN

		vec3 patternColor = texture2D(patternTexture, vUvPattern).rgb;

		#ifdef X_RAY

			float hiddenFactor = 0.5;

		#else

			float hiddenFactor = 0.0;

		#endif

		float visibilityFactor = (1.0 - mask.y > 0.0) ? 1.0 : hiddenFactor;
		color += visibilityFactor * (1.0 - mask.x) * (1.0 - patternColor);

	#endif

	outputColor = vec4(color, inputColor.a);

}
