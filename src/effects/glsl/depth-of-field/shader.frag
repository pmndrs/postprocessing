uniform sampler2D farBuffer;
uniform sampler2D nearBuffer;
uniform sampler2D cocNearBuffer;
uniform sampler2D cocFarBuffer;

uniform float scale;

void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {

	vec4 colorFar = texture2D(farBuffer, uv);
	vec4 colorNear = texture2D(nearBuffer, uv);

	float near = texture2D(cocNearBuffer, uv).r;
	float far = texture2D(cocFarBuffer, uv).g;

	float blendNear = min(scale * near, 0.5) * 2.0;
	float blendFar = min(scale * far, 0.5) * 2.0;

	vec4 result = mix(inputColor, colorFar, blendFar);
	result = mix(result, colorNear, blendNear);

	outputColor = result;

}
