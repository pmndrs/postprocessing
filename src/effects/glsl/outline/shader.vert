uniform float patternScale;

varying vec2 vUvPattern;

void mainSupport(const in vec2 uv) {

	vUvPattern = uv * vec2(aspect, 1.0) * patternScale;

}
