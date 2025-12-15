vec4 blend(const in vec4 dst, const in vec4 src, const in float opacity) {

	vec3 a = RGBToHSL(dst.rgb);
	vec3 b = RGBToHSL(src.rgb);
	vec3 c = HSLToRGB(vec3(b.x, a.yz));
	return mix(dst, vec4(c, max(dst.a, src.a)), opacity);

}
