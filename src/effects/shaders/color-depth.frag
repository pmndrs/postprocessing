uniform vec3 colorRanges;

vec4 mainImage(const in vec4 inputColor, const in vec2 uv, const in GData gData) {

	return vec4(floor(inputColor.rgb * colorRanges) / colorRanges, inputColor.a);

}
