uniform float patternScale;

varying vec2 vUvPattern;

void mainSupport() {

	vUvPattern = vUv * vec2(aspect, 1.0) * patternScale;

}
