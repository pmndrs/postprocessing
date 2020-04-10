uniform sampler2D nearColorBuffer;
uniform sampler2D farColorBuffer;
uniform sampler2D nearCoCBuffer;
uniform sampler2D farCoCBuffer;

uniform float scale;

void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {

	vec4 colorNear = texture2D(nearColorBuffer, uv);
	vec4 colorFar = texture2D(farColorBuffer, uv);

	float CoCNear = texture2D(nearCoCBuffer, uv).r;
	float CoCFar = texture2D(farCoCBuffer, uv).g;
	vec2 blend = min(vec2(CoCNear, CoCFar) * scale, 1.0);

	// The far color buffer has been premultiplied with the CoC buffer.
	vec4 result = inputColor * (1.0 - blend.g) + colorFar;
	result = mix(result, colorNear, blend.r);

	outputColor = result;

}
