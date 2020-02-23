uniform sampler2D nearBuffer;
uniform sampler2D farBuffer;
uniform sampler2D cocBuffer;

uniform float scale;

void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {

	vec4 colorNear = texture2D(nearBuffer, uv);
	vec4 colorFar = texture2D(farBuffer, uv);

	float CoCNear = texture2D(cocBuffer, uv).r;
	float blendNear = min(scale * CoCNear, 1.0);

	vec4 result = inputColor * (1.0 - colorFar.a) + colorFar;
	result = mix(result, colorNear, blendNear);

	outputColor = result;

}
