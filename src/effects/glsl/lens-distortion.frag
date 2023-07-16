uniform vec2 distortion;
uniform vec2 principalPoint; 
uniform vec2 focalLength; 
uniform float skew;

float mask(const in vec2 uv) {

	return float(uv.s >= 0.0 && uv.s <= 1.0 && uv.t >= 0.0 && uv.t <= 1.0);

}

void mainUv(inout vec2 uv) {

	vec2 xn = 2.0 * (uv.st - 0.5); // [-1, 1]
	vec3 xDistorted = vec3((1.0 + distortion * dot(xn, xn)) * xn, 1.0);

	mat3 kk = mat3(
		vec3(focalLength.x, 0.0, 0.0),
		vec3(skew * focalLength.x, focalLength.y, 0.0),
		vec3(principalPoint.x, principalPoint.y, 1.0)
	);

	uv = (kk * xDistorted).xy * 0.5 + 0.5;

}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	outputColor = mask(uv) * inputColor;

}
