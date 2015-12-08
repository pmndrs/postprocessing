uniform sampler2D tColor;
uniform sampler2D tDepth;
uniform float textureWidth;
uniform float textureHeight;

uniform float focalDepth;
uniform float focalLength;
uniform float fstop;
uniform bool showFocus;

uniform float znear;
uniform float zfar;

uniform bool manualdof;
uniform bool vignetting;
uniform bool shaderFocus;
uniform bool noise;
uniform bool depthblur;
uniform bool pentagon;

uniform vec2 focusCoords;
uniform float maxblur;
uniform float threshold;
uniform float gain;
uniform float bias;
uniform float fringe;
uniform float dithering;

varying vec2 vUv;

const float PI = 3.14159265;
const float TWO_PI = PI * 2.0;
const int samples = SAMPLES; // Samples on the first ring.
const int rings = RINGS;
const int maxringsamples = rings * samples;

float ndofstart = 1.0; 
float ndofdist = 2.0;
float fdofstart = 1.0;
float fdofdist = 3.0;

float CoC = 0.03; // Circle of Confusion size in mm (35mm film = 0.03mm).

float vignout = 1.3;
float vignin = 0.0;
float vignfade = 22.0; 

float dbsize = 1.25;
float feather = 0.4;

/**
 * Pentagonal shape creation.
 */

float penta(vec2 coords) {

	float scale = float(rings) - 1.3;

	vec4  HS0 = vec4( 1.0,          0.0,         0.0,  1.0);
	vec4  HS1 = vec4( 0.309016994,  0.951056516, 0.0,  1.0);
	vec4  HS2 = vec4(-0.809016994,  0.587785252, 0.0,  1.0);
	vec4  HS3 = vec4(-0.809016994, -0.587785252, 0.0,  1.0);
	vec4  HS4 = vec4( 0.309016994, -0.951056516, 0.0,  1.0);
	vec4  HS5 = vec4( 0.0        ,  0.0        , 1.0,  1.0);

	vec4  one = vec4(1.0);

	vec4 P = vec4((coords), vec2(scale, scale));

	vec4 dist = vec4(0.0);
	float inorout = -4.0;

	dist.x = dot(P, HS0);
	dist.y = dot(P, HS1);
	dist.z = dot(P, HS2);
	dist.w = dot(P, HS3);

	dist = smoothstep(-feather, feather, dist);

	inorout += dot(dist, one);

	dist.x = dot(P, HS4);
	dist.y = HS5.w - abs(P.z);

	dist = smoothstep(-feather, feather, dist);
	inorout += dist.x;

	return clamp(inorout, 0.0, 1.0);

}

/**
 * Depth buffer blur.
 */

float bdepth(vec2 coords) {

	float d = 0.0;
	float kernel[9];
	vec2 offset[9];

	vec2 wh = vec2(1.0 / textureWidth,1.0 / textureHeight) * dbsize;

	offset[0] = vec2(-wh.x, -wh.y);
	offset[1] = vec2(0.0, -wh.y);
	offset[2] = vec2(wh.x -wh.y);

	offset[3] = vec2(-wh.x,  0.0);
	offset[4] = vec2(0.0,   0.0);
	offset[5] = vec2(wh.x,  0.0);

	offset[6] = vec2(-wh.x, wh.y);
	offset[7] = vec2(0.0, wh.y);
	offset[8] = vec2(wh.x, wh.y);

	kernel[0] = 1.0 / 16.0; kernel[1] = 2.0 / 16.0; kernel[2] = 1.0 / 16.0;
	kernel[3] = 2.0 / 16.0; kernel[4] = 4.0 / 16.0; kernel[5] = 2.0 / 16.0;
	kernel[6] = 1.0 / 16.0; kernel[7] = 2.0 / 16.0; kernel[8] = 1.0 / 16.0;

	for(int i = 0; i < 9; ++i) {

		float tmp = texture2D(tDepth, coords + offset[i]).r;
		d += tmp * kernel[i];

	}

	return d;

}

/**
 * Processing the sample.
 */

vec3 color(vec2 coords, float blur) {

	vec3 col = vec3(0.0);
	vec2 texel = vec2(1.0 / textureWidth, 1.0 / textureHeight);

	col.r = texture2D(tColor, coords + vec2(0.0, 1.0) * texel * fringe * blur).r;
	col.g = texture2D(tColor, coords + vec2(-0.866, -0.5) * texel * fringe * blur).g;
	col.b = texture2D(tColor, coords + vec2(0.866, -0.5) * texel * fringe * blur).b;

	vec3 lumcoeff = vec3(0.299, 0.587, 0.114);
	float lum = dot(col.rgb, lumcoeff);
	float thresh = max((lum - threshold) * gain, 0.0);

	return col + mix(vec3(0.0), col, thresh * blur);

}

/**
 * Generating noise/pattern texture for dithering.
 */

vec2 rand(vec2 coord) {

	float noiseX = ((fract(1.0 - coord.s * (textureWidth / 2.0)) * 0.25) + (fract(coord.t * (textureHeight / 2.0)) * 0.75)) * 2.0 - 1.0;
	float noiseY = ((fract(1.0 - coord.s * (textureWidth / 2.0)) * 0.75) + (fract(coord.t * (textureHeight / 2.0)) * 0.25)) * 2.0 - 1.0;

	if(noise) {

		noiseX = clamp(fract(sin(dot(coord, vec2(12.9898, 78.233))) * 43758.5453), 0.0, 1.0) * 2.0 - 1.0;
		noiseY = clamp(fract(sin(dot(coord, vec2(12.9898, 78.233) * 2.0)) * 43758.5453), 0.0, 1.0) * 2.0 - 1.0;

	}

	return vec2(noiseX, noiseY);

}

/**
 * Distance based edge smoothing.
 */

vec3 debugFocus(vec3 col, float blur, float depth) {

	float edge = 0.002 * depth;
	float m = clamp(smoothstep(0.0, edge, blur), 0.0, 1.0);
	float e = clamp(smoothstep(1.0 - edge, 1.0, blur), 0.0, 1.0);

	col = mix(col, vec3(1.0, 0.5, 0.0), (1.0 - m) * 0.6);
	col = mix(col, vec3(0.0, 0.5, 1.0), ((1.0 - e) - (1.0 - m)) * 0.2);

	return col;

}

float linearize(float depth) {

	return -zfar * znear / (depth * (zfar - znear) - zfar);

}

float vignette() {

	float dist = distance(vUv.xy, vec2(0.5, 0.5));
	dist = smoothstep(vignout + (fstop / vignfade), vignin + (fstop / vignfade), dist);

	return clamp(dist, 0.0, 1.0);

}

float gather(float i, float j, int ringsamples, inout vec3 col, float w, float h, float blur) {

	float rings2 = float(rings);
	float step = TWO_PI / float(ringsamples);
	float pw = cos(j * step) * i;
	float ph = sin(j * step) * i;
	float p = 1.0;

	if(pentagon) {

		p = penta(vec2(pw,ph));

	}

	col += color(vUv.xy + vec2(pw * w, ph * h), blur) * mix(1.0, i / rings2, bias) * p;

	return 1.0 * mix(1.0, i / rings2, bias) * p;

}

void main() {

	// Scene depth calculation.

	float depth = linearize(texture2D(tDepth, vUv.xy).x);

	if(depthblur) { depth = linearize(bdepth(vUv.xy)); }

	// Focal plane calculation.

	float fDepth = focalDepth;

	if(shaderFocus) { fDepth = linearize(texture2D(tDepth, focusCoords).x); }

	// Dof blur factor calculation.

	float blur = 0.0;

	float a, b, c, d, o;

	if(manualdof) {

		a = depth - fDepth; // Focal plane.
		b = (a - fdofstart) / fdofdist; // Far DoF.
		c = (-a - ndofstart) / ndofdist; // Near Dof.
		blur = (a > 0.0) ? b : c;

	} else {

		f = focalLength; // Focal length in mm.
		d = fDepth * 1000.0; // Focal plane in mm.
		o = depth * 1000.0; // Depth in mm.

		a = (o * f) / (o - f);
		b = (d * f) / (d - f);
		c = (d - f) / (d * fstop * CoC);

		blur = abs(a - b) * c;
	}

	blur = clamp(blur, 0.0, 1.0);

	// Calculation of pattern for dithering.

	vec2 noise = rand(vUv.xy) * dithering * blur;

	// Getting blur x and y step factor.

	float w = (1.0 / textureWidth) * blur * maxblur + noise.x;
	float h = (1.0 / textureHeight) * blur * maxblur + noise.y;

	// Calculation of final color.

	vec3 col = vec3(0.0);

	if(blur < 0.05) {

		// Some optimization thingy.
		col = texture2D(tColor, vUv.xy).rgb;

	} else {

		col = texture2D(tColor, vUv.xy).rgb;
		float s = 1.0;
		int ringsamples;

		for(int i = 1; i <= rings; ++i) {

			// Unboxing.
			ringsamples = i * samples;

			for(int j = 0; j < maxringsamples; ++j) {

				if(j >= ringsamples) { break; }

				s += gather(float(i), float(j), ringsamples, col, w, h, blur);

			}

		}

		col /= s; // Divide by sample count.

	}

	if(showFocus) { col = debugFocus(col, blur, depth); }

	if(vignetting) { col *= vignette(); }

	gl_FragColor.rgb = col;
	gl_FragColor.a = 1.0;

}
