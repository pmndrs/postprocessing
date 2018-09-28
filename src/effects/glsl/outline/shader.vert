uniform float patternScale;

varying vec2 vUvPattern;

void mainSupport() {

	vUvPattern = uv * vec2(aspect, 1.0) * patternScale;

}
