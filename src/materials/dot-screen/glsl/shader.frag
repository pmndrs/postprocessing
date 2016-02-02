uniform sampler2D tDiffuse;

uniform float angle;
uniform float scale;

varying vec2 vUv;
varying vec2 vUvPattern;

float pattern() {

	float s = sin(angle);
	float c = cos(angle);

	vec2 point = vec2(c * vUvPattern.x - s * vUvPattern.y, s * vUvPattern.x + c * vUvPattern.y) * scale;

	return (sin(point.x) * sin(point.y)) * 4.0;

}

void main() {

	vec4 color = texture2D(tDiffuse, vUv);
	float average = (color.r + color.g + color.b) / 3.0;

	gl_FragColor = vec4(vec3(average * 10.0 - 5.0 + pattern()), color.a);

}
