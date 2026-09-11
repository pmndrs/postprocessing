#ifdef FRAMEBUFFER_PRECISION_HIGH

	uniform mediump sampler2D bloomBuffer;
	uniform mediump sampler2D featuresBuffer;

#else

	uniform lowp sampler2D bloomBuffer;
	uniform lowp sampler2D featuresBuffer;

#endif

uniform float intensity;

void mainImage(const vec4 inputColor, const vec2 uv, out vec4 outputColor) {

  vec3 bloom = texture(bloomBuffer, uv).rgb;
  vec3 features = texture(featuresBuffer, uv).rgb;
  outputColor = vec4(inputColor.rgb + (bloom + features) * intensity, inputColor.a);

}
