#ifdef FRAMEBUFFER_PRECISION_HIGH

	uniform mediump sampler2D nearColorBuffer;
	uniform mediump sampler2D farColorBuffer;

#else

	uniform lowp sampler2D nearColorBuffer;
	uniform lowp sampler2D farColorBuffer;

#endif

uniform lowp sampler2D nearCoCBuffer;
uniform float scale;

void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {

	vec4 colorNear = texture2D(nearColorBuffer, uv);
	vec4 colorFar = texture2D(farColorBuffer, uv);

	float CoCNear = texture2D(nearCoCBuffer, uv).r;
	CoCNear = min(CoCNear * scale, 1.0);

	// The far color buffer has been premultiplied with the CoC buffer.
	vec4 result = inputColor * (1.0 - colorFar.a) + colorFar;
	result = mix(result, colorNear, CoCNear);

	outputColor = result;

}
