uniform sampler2D asciiTexture;
uniform vec4 cellCount; // XY = cell count, ZW = inv cell count

#ifdef USE_COLOR

	uniform vec3 color;

#endif

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	vec2 pixelizedUv = cellCount.zw * (0.5 + floor(uv * cellCount.xy));
	vec4 texel = texture2D(inputBuffer, pixelizedUv);
	float lum = luminance(texel.rgb);

	#ifdef INVERTED

		// Only LDR colors can be inverted, so make sure lum doesn't exceed 1.
		lum = 1.0 - min(lum, 1.0);

	#endif

	float characterIndex = floor(CHAR_COUNT_MINUS_ONE * lum);
	vec2 characterPosition = vec2(mod(characterIndex, CELL_COUNT), floor(characterIndex * INV_CELL_COUNT));
	vec2 offset = vec2(characterPosition.x, -characterPosition.y) * INV_CELL_COUNT;
	vec2 characterUv = mod(uv * (cellCount.xy * INV_CELL_COUNT), INV_CELL_COUNT) - vec2(0.0, INV_CELL_COUNT) + offset;
	vec4 asciiCharacter = texture2D(asciiTexture, characterUv);

	#ifdef USE_COLOR

		outputColor = vec4(color * asciiCharacter.r, inputColor.a);

	#else

		outputColor = vec4(texel.rgb * asciiCharacter.r, inputColor.a);

	#endif

}
