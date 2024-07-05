#define SQRT2_MINUS_ONE 0.41421356
#define SQRT2_HALF_MINUS_ONE 0.20710678
#define SHAPE_DOT 1
#define SHAPE_ELLIPSE 2
#define SHAPE_LINE 3
#define SHAPE_SQUARE 4

uniform vec3 rotationRGB;
uniform float radius;
uniform float scatterFactor;

struct Cell {
	vec2 n;
	vec2 p1;
	vec2 p2;
	vec2 p3;
	vec2 p4;
	float sample1;
	float sample2;
	float sample3;
	float sample4;
};

float getPattern(float cellSample, vec2 coord, vec2 n, vec2 p, float angle, float maxRadius) {

	float magnitude = length(coord - p);
	float r = cellSample;

	#if SHAPE == SHAPE_DOT

		r = pow(abs(r), 1.125) * maxRadius;
	
	#elif SHAPE == SHAPE_ELLIPSE

		r = pow(abs(r), 1.125) * maxRadius;

		if(magnitude != 0.0) {

			float dotP = abs(dot((p - coord) / magnitude, n));

			magnitude = dot(
				vec2(magnitude, magnitude * dotP),
				vec2(1.0 - SQRT2_HALF_MINUS_ONE, SQRT2_MINUS_ONE)
			);

		}

	#elif SHAPE == SHAPE_LINE

		r = pow(abs(r), 1.5) * maxRadius;
		float dotP = dot(p - coord, n);
		magnitude = length(n * dotP);
	
	#elif SHAPE == SHAPE_SQUARE

		float theta = atan(p.y - coord.y, p.x - coord.x) - angle;
		float sinT = abs(sin(theta));
		float cosT = abs(cos(theta));
		r = pow(abs(r), 1.4);
		r += (sinT > cosT) ? r - sinT * r : r - cosT * r;
		r *= maxRadius;

	#endif

	return r - magnitude;

}

vec4 getSample(vec2 point) {

	vec4 texel = texture(gBuffer.color, point * resolution.zw);
	float base = rand(floor(point)) * PI2;
	float step = PI2 * INV_SAMPLES;
	float magnitude = radius * 0.66;

	for(int i = 0; i < SAMPLES; ++i) {

		float r = base + step * float(i);
		vec2 coord = point + vec2(cos(r), sin(r)) * magnitude;
		texel += texture(gBuffer.color, coord * resolution.zw);

	}

	texel *= INV_SAMPLES_PLUS_ONE;
	return texel;

}

Cell getReferenceCell(vec2 p, vec2 origin, float gridAngle, float step) {

	Cell cell;

	vec2 n = vec2(cos(gridAngle), sin(gridAngle));

	vec2 v = p - origin;
	float dotNormal = dot(v, n);
	float dotLine = dot(v, vec2(-n.y, n.x));

	float threshold = step * 0.5;
	vec2 offset = n * dotNormal;

	float offsetNormal = mod(length(offset), step);
	float normalDir = (dotNormal < 0.0) ? 1.0 : -1.0;
	float normalScale = (offsetNormal < threshold) ? -offsetNormal : step - offsetNormal;
	normalScale *= normalDir;

	float offsetLine = mod(length(v - offset), step);
	float lineDir = (dotLine < 0.0) ? 1.0 : -1.0;
	float lineScale = (offsetLine < threshold) ? -offsetLine : step - offsetLine;
	lineScale *= lineDir;

	// Get the closest corner.
	cell.n = n;
	cell.p1 = p - n * normalScale + vec2(n.y, -n.x) * lineScale;

	if(scatterFactor != 0.0) {

		float offMag = scatterFactor * threshold * 0.5;
		float offAngle = rand(floor(cell.p1)) * PI2;
		cell.p1 += vec2(cos(offAngle), sin(offAngle)) * offMag;

	}

	// Find corners.
	float normalStep = normalDir * ((offsetNormal < threshold) ? step : -step);
	float lineStep = lineDir * ((offsetLine < threshold) ? step : -step);
	cell.p2 = cell.p1 - n.xy * normalStep;
	cell.p3 = cell.p1 + vec2(n.y, -n.x) * lineStep;
	cell.p4 = cell.p1 - n * normalStep + vec2(n.y, -n.x) * lineStep;

	return cell;

}

float halftone(Cell cell, vec2 p, float angle, float aa) {

	float distC1 = getPattern(cell.sample1, cell.p1, cell.n, p, angle, radius);
	float distC2 = getPattern(cell.sample2, cell.p2, cell.n, p, angle, radius);
	float distC3 = getPattern(cell.sample3, cell.p3, cell.n, p, angle, radius);
	float distC4 = getPattern(cell.sample4, cell.p4, cell.n, p, angle, radius);

	float result = (distC1 > 0.0) ? clamp(distC1 * aa, 0.0, 1.0) : 0.0;
	result += (distC2 > 0.0) ? clamp(distC2 * aa, 0.0, 1.0) : 0.0;
	result += (distC3 > 0.0) ? clamp(distC3 * aa, 0.0, 1.0) : 0.0;
	result += (distC4 > 0.0) ? clamp(distC4 * aa, 0.0, 1.0) : 0.0;
	result = clamp(result, 0.0, 1.0);

	return result;

}

vec4 mainImage(const in vec4 inputColor, const in vec2 uv, const in GData gData) {

	vec2 p = uv * resolution.xy;
	vec2 origin = vec2(0.0);
	float aa = (radius < 2.5) ? 1.0 / (radius * 0.5) : 0.8; // 1.0 / 1.25 = 0.8

	#ifdef RGB_ROTATION

		Cell cellR = getReferenceCell(p, origin, rotationRGB.r, radius);
		Cell cellG = getReferenceCell(p, origin, rotationRGB.g, radius);
		Cell cellB = getReferenceCell(p, origin, rotationRGB.b, radius);

		cellR.sample1 = getSample(cellR.p1).r;
		cellR.sample2 = getSample(cellR.p2).r;
		cellR.sample3 = getSample(cellR.p3).r;
		cellR.sample4 = getSample(cellR.p4).r;

		cellG.sample1 = getSample(cellG.p1).g;
		cellG.sample2 = getSample(cellG.p2).g;
		cellG.sample3 = getSample(cellG.p3).g;
		cellG.sample4 = getSample(cellG.p4).g;

		cellB.sample1 = getSample(cellB.p1).b;
		cellB.sample2 = getSample(cellB.p2).b;
		cellB.sample3 = getSample(cellB.p3).b;
		cellB.sample4 = getSample(cellB.p4).b;

	#else

		Cell cell = getReferenceCell(p, origin, rotationRGB.r, radius);
		Cell cellR = cell;
		Cell cellG = cell;
		Cell cellB = cell;

		vec3 sample1 = getSample(cell.p1).rgb;
		vec3 sample2 = getSample(cell.p2).rgb;
		vec3 sample3 = getSample(cell.p3).rgb;
		vec3 sample4 = getSample(cell.p4).rgb;

		cellR.sample1 = sample1.r;
		cellR.sample2 = sample2.r;
		cellR.sample3 = sample3.r;
		cellR.sample4 = sample4.r;

		cellG.sample1 = sample1.g;
		cellG.sample2 = sample2.g;
		cellG.sample3 = sample3.g;
		cellG.sample4 = sample4.g;

		cellB.sample1 = sample1.b;
		cellB.sample2 = sample2.b;
		cellB.sample3 = sample3.b;
		cellB.sample4 = sample4.b;

	#endif

	vec3 pattern = vec3(
		halftone(cellR, p, rotationRGB.r, aa),
		halftone(cellG, p, rotationRGB.g, aa),
		halftone(cellB, p, rotationRGB.b, aa)
	);

	return vec4(pattern, inputColor.a);

}
