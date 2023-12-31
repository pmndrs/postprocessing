vec4 blend(const in vec4 x, const in vec4 y, const in float opacity) {

	vec3 xHSL = RGBToHSL(x.rgb);
	vec3 yHSL = RGBToHSL(y.rgb);
	vec3 z = HSLToRGB(vec3(yHSL.x, xHSL.yz));
	return mix(x, vec4(z, y.a), opacity);

}
