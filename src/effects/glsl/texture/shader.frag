uniform sampler2D texture;

#ifdef ASPECT_CORRECTION

	varying vec2 vUv2;

#endif

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	#ifdef ASPECT_CORRECTION

		outputColor = texture2D(texture, vUv2);

	#else

		outputColor = texture2D(texture, uv);

	#endif

}
