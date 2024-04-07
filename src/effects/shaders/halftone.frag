#define SQRT2_MINUS_ONE 0.41421356
#define SQRT2_HALF_MINUS_ONE 0.20710678
#define SHAPE_DOT 1
#define SHAPE_ELLIPSE 2
#define SHAPE_LINE 3
#define SHAPE_SQUARE 4

uniform float radius;
uniform vec3 rotationRGB;
uniform float scatter;
uniform int shape;

float hypot(float x, float y) {

	// vector magnitude
	return sqrt(x * x + y * y);

}

float distanceToDotRadius(float channel, vec2 coord, vec2 normal, vec2 p, float angle, float radMax) {

	// apply shape-specific transforms
	float dist = hypot(coord.x - p.x, coord.y - p.y);
	float rad = channel;

	if (shape == SHAPE_DOT) {

		rad = pow(abs(rad), 1.125) * radMax;

	} else if (shape == SHAPE_ELLIPSE) {

		rad = pow(abs(rad), 1.125) * radMax;

		if (dist != 0.0) {
			float dotP = abs((p.x - coord.x) / dist * normal.x + (p.y - coord.y) / dist * normal.y);
			dist = (dist * (1.0 - SQRT2_HALF_MINUS_ONE)) + dotP * dist * SQRT2_MINUS_ONE;
		}

	} else if (shape == SHAPE_LINE) {

		rad = pow(abs(rad), 1.5) * radMax;
		float dotP = (p.x - coord.x) * normal.x + (p.y - coord.y) * normal.y;
		dist = hypot(normal.x * dotP, normal.y * dotP);

	} else if (shape == SHAPE_SQUARE) {

		float theta = atan(p.y - coord.y, p.x - coord.x) - angle;
		float sinT = abs(sin(theta));
		float cosT = abs(cos(theta));
		rad = pow(abs(rad), 1.4);
		rad = radMax * (rad + ((sinT > cosT) ? rad - sinT * rad : rad - cosT * rad));

	}

	return rad - dist;

}

struct Cell {

	// grid sample positions
	vec2 normal;
	vec2 p1;
	vec2 p2;
	vec2 p3;
	vec2 p4;
	float sample1;
	float sample2;
	float sample3;
	float sample4;

};

vec4 getSample(vec2 point) {

	// multi-sampled point
	vec4 tex = texture(gBuffer.color, point * resolution.zw);
	float base = rand(vec2(floor(point.x), floor(point.y))) * PI2;
	float step = PI2 / float(SAMPLES);
	float dist = radius * 0.66;

	for (int i = 0; i < SAMPLES; ++i) {

		float r = base + step * float(i);
		vec2 coord = point + vec2(cos(r) * dist, sin(r) * dist);
		tex += texture(gBuffer.color, coord * resolution.zw);

	}

	tex /= float(SAMPLES) + 1.0;
	return tex;

}

float getDotColor(Cell c, vec2 p, int channel, float angle, float aa) {

	// get color for given point
	float distC1, distC2, distC3, distC4, res;

	if (channel == 0) {

		c.sample1 = getSample(c.p1).r;
		c.sample2 = getSample(c.p2).r;
		c.sample3 = getSample(c.p3).r;
		c.sample4 = getSample(c.p4).r;

	} else if (channel == 1) {

		c.sample1 = getSample(c.p1).g;
		c.sample2 = getSample(c.p2).g;
		c.sample3 = getSample(c.p3).g;
		c.sample4 = getSample(c.p4).g;

	} else {

		c.sample1 = getSample(c.p1).b;
		c.sample3 = getSample(c.p3).b;
		c.sample2 = getSample(c.p2).b;
		c.sample4 = getSample(c.p4).b;

	}

	distC1 = distanceToDotRadius(c.sample1, c.p1, c.normal, p, angle, radius);
	distC2 = distanceToDotRadius(c.sample2, c.p2, c.normal, p, angle, radius);
	distC3 = distanceToDotRadius(c.sample3, c.p3, c.normal, p, angle, radius);
	distC4 = distanceToDotRadius(c.sample4, c.p4, c.normal, p, angle, radius);
	res = (distC1 > 0.0) ? clamp(distC1 / aa, 0.0, 1.0) : 0.0;
	res += (distC2 > 0.0) ? clamp(distC2 / aa, 0.0, 1.0) : 0.0;
	res += (distC3 > 0.0) ? clamp(distC3 / aa, 0.0, 1.0) : 0.0;
	res += (distC4 > 0.0) ? clamp(distC4 / aa, 0.0, 1.0) : 0.0;
	res = clamp(res, 0.0, 1.0);

	return res;

}

Cell getReferenceCell(vec2 p, vec2 origin, float gridAngle, float step) {

	// get containing cell
	Cell c;

	// calc grid
	vec2 n = vec2(cos(gridAngle), sin(gridAngle));
	float threshold = step * 0.5;
	float dotNormal = n.x * (p.x - origin.x) + n.y * (p.y - origin.y);
	float dotLine = -n.y * (p.x - origin.x) + n.x * (p.y - origin.y);
	vec2 offset = vec2(n.x * dotNormal, n.y * dotNormal);
	float offsetNormal = mod(hypot(offset.x, offset.y), step);
	float normalDir = (dotNormal < 0.0) ? 1.0 : -1.0;
	float normalScale = ((offsetNormal < threshold) ? -offsetNormal : step - offsetNormal) * normalDir;
	float offsetLine = mod(hypot((p.x - offset.x) - origin.x, (p.y - offset.y) - origin.y), step);
	float lineDir = (dotLine < 0.0) ? 1.0 : -1.0;
	float lineScale = ((offsetLine < threshold) ? -offsetLine : step - offsetLine) * lineDir;

	// get closest corner
	c.normal = n;
	c.p1.x = p.x - n.x * normalScale + n.y * lineScale;
	c.p1.y = p.y - n.y * normalScale - n.x * lineScale;

	// scatter
	if (scatter != 0.0) {

		float offMag = scatter * threshold * 0.5;
		float offAngle = rand(vec2(floor(c.p1.x), floor(c.p1.y))) * PI2;
		c.p1.x += cos(offAngle) * offMag;
		c.p1.y += sin(offAngle) * offMag;

	}

	// find corners
	float normalStep = normalDir * ((offsetNormal < threshold) ? step : -step);
	float lineStep = lineDir * ((offsetLine < threshold) ? step : -step);
	c.p2.x = c.p1.x - n.x * normalStep;
	c.p2.y = c.p1.y - n.y * normalStep;
	c.p3.x = c.p1.x + n.y * lineStep;
	c.p3.y = c.p1.y - n.x * lineStep;
	c.p4.x = c.p1.x - n.x * normalStep + n.y * lineStep;
	c.p4.y = c.p1.y - n.y * normalStep - n.x * lineStep;

	return c;

}

vec4 mainImage(const in vec4 inputColor, const in vec2 uv, const in GData gData) {

	// setup
	vec2 p = uv * resolution.xy;
	vec2 origin = vec2(0, 0);
	float aa = (radius < 2.5) ? radius * 0.5 : 1.25;

	// get channel samples
	Cell cellR = getReferenceCell(p, origin, rotationRGB.r, radius);
	Cell cellG = getReferenceCell(p, origin, rotationRGB.g, radius);
	Cell cellB = getReferenceCell(p, origin, rotationRGB.b, radius);
	float r = getDotColor(cellR, p, 0, rotationRGB.r, aa);
	float g = getDotColor(cellG, p, 1, rotationRGB.g, aa);
	float b = getDotColor(cellB, p, 2, rotationRGB.b, aa);

	return vec4(r, g, b, 1.0);

}
