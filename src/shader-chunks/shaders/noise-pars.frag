/**
 * Bitwise noise functions, based on work by Lee C.
 *
 * @see https://amindforeverprogramming.blogspot.com/2013/07/random-floats-in-glsl-330.html
 */

uint uhash(uint x) {

	x += x >> 11;
	x ^= x << 7;
	x += x >> 15;
	x ^= x << 5;
	x += x >> 12;
	x ^= x << 9;
	return x;

}

uint uhash(uvec2 p) {

	uint x = p.x;
	x += x >> 11;
	x ^= x << 7;
	x += p.y;
	x ^= x << 6;
	x += x >> 15;
	x ^= x << 5;
	x += x >> 12;
	x ^= x << 9;
	return x;

}

uint uhash(uvec3 p) {

	uint x = p.x;
	x += x >> 11;
	x ^= x << 7;
	x += p.y;
	x ^= x << 3;
	x += p.z ^ (x >> 14);
	x ^= x << 6;
	x += x >> 15;
	x ^= x << 5;
	x += x >> 12;
	x ^= x << 9;
	return x;

}

float urand(uint h) {

	const uint mantissaMask = 0x007FFFFFu;
	const uint one = 0x3F800000u;

	h &= mantissaMask;
	h |= one;

	float r2 = uintBitsToFloat(h);
	return r2 - 1.0;

}

float urand(float p) {

	return urand(uhash(floatBitsToUint(p)));

}

float urand(vec2 p) {

	return urand(uhash(floatBitsToUint(p)));

}

float urand(vec3 p) {

	return urand(uhash(floatBitsToUint(p)));

}
