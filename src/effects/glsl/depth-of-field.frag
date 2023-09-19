#ifdef FRAMEBUFFER_PRECISION_HIGH

	uniform mediump sampler2D nearColorBuffer;
	uniform mediump sampler2D farColorBuffer;

#else

	uniform lowp sampler2D nearColorBuffer;
	uniform lowp sampler2D farColorBuffer;

#endif

uniform lowp sampler2D nearCoCBuffer;
uniform lowp sampler2D farCoCBuffer;
uniform float scale;

void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {

	vec4 colorNear = texture2D(nearColorBuffer, uv);
	vec4 colorFar = texture2D(farColorBuffer, uv);

	#if MASK_FUNCTION == 1

		// Use the CoC from the far color buffer's alpha channel.
		vec2 cocNearFar = vec2(texture2D(nearCoCBuffer, uv).r, colorFar.a);
		cocNearFar.x = min(cocNearFar.x * scale, 1.0);

	#else

		vec2 cocNearFar = vec2(texture2D(nearCoCBuffer, uv).r, texture2D(farCoCBuffer, uv).g);
		cocNearFar = min(cocNearFar * scale, 1.0);

	#endif

	// The far color buffer has been premultiplied with the CoC buffer.
	vec4 result = inputColor * (1.0 - cocNearFar.y) + colorFar;
	result = mix(result, colorNear, cocNearFar.x);

	outputColor = result;

}
