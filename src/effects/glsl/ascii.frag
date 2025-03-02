uniform sampler2D asciiTexture;
uniform vec4 cellCount; // XY = cell count, ZW = inv cell count

#ifdef USE_COLOR

	uniform vec3 color;

#endif

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	vec2 pixelizedUv = cellCount.zw * (0.5 + floor(uv * cellCount.xy));
	vec4 texel = texture(inputBuffer, pixelizedUv);

	// Use the luminance of the cell as a factor from 0 to 1 to index the character.
	float lum = min(luminance(texel.rgb), 1.0);

	#ifdef INVERTED

		lum = 1.0 - lum;

	#endif

	float characterIndex = floor(CHAR_COUNT_MINUS_ONE * lum);
	vec2 characterPosition = vec2(mod(characterIndex, TEX_CELL_COUNT), floor(characterIndex * INV_TEX_CELL_COUNT));
	vec2 offset = vec2(characterPosition.x, -characterPosition.y) * INV_TEX_CELL_COUNT;
	vec2 characterUv = mod(uv * (cellCount.xy * INV_TEX_CELL_COUNT), INV_TEX_CELL_COUNT);
	characterUv = characterUv - vec2(0.0, INV_TEX_CELL_COUNT) + offset;
	float asciiCharacter = texture(asciiTexture, characterUv).r;

	#ifdef USE_COLOR

		outputColor = vec4(color * asciiCharacter, inputColor.a);

	#else

		outputColor = vec4(texel.rgb * asciiCharacter, inputColor.a);

	#endif

}