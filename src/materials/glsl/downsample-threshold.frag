#include <common>

#ifdef FRAMEBUFFER_PRECISION_HIGH

	uniform mediump sampler2D inputBuffer;

#else

	uniform lowp sampler2D inputBuffer;

#endif

uniform float thresholdLevel;
uniform float thresholdRange;

varying vec2 vCenterUv1;
varying vec2 vCenterUv2;
varying vec2 vCenterUv3;
varying vec2 vCenterUv4;
varying vec2 vRowUv1;
varying vec2 vRowUv2;
varying vec2 vRowUv3;
varying vec2 vRowUv4;
varying vec2 vRowUv5;
varying vec2 vRowUv6;
varying vec2 vRowUv7;
varying vec2 vRowUv8;
varying vec2 vRowUv9;

float clampToBorder(const vec2 uv) {

	return float(uv.x >= 0.0 && uv.x <= 1.0 && uv.y >= 0.0 && uv.y <= 1.0);

}

// Reference: https://learnopengl.com/Guest-Articles/2022/Phys.-Based-Bloom
void main() {

	vec4 color = 0.125 * texture2D(inputBuffer, vec2(vRowUv5));

	vec4 weight =
		0.03125 *
		vec4(
			clampToBorder(vRowUv1),
			clampToBorder(vRowUv3),
			clampToBorder(vRowUv7),
			clampToBorder(vRowUv9)
		);
	color += weight.x * texture2D(inputBuffer, vec2(vRowUv1));
	color += weight.y * texture2D(inputBuffer, vec2(vRowUv3));
	color += weight.z * texture2D(inputBuffer, vec2(vRowUv7));
	color += weight.w * texture2D(inputBuffer, vec2(vRowUv9));

	weight =
		0.0625 *
		vec4(
			clampToBorder(vRowUv2),
			clampToBorder(vRowUv4),
			clampToBorder(vRowUv6),
			clampToBorder(vRowUv8)
		);
	color += weight.x * texture2D(inputBuffer, vec2(vRowUv2));
	color += weight.y * texture2D(inputBuffer, vec2(vRowUv4));
	color += weight.z * texture2D(inputBuffer, vec2(vRowUv6));
	color += weight.w * texture2D(inputBuffer, vec2(vRowUv8));

	weight =
		0.125 *
		vec4(
			clampToBorder(vRowUv2),
			clampToBorder(vRowUv4),
			clampToBorder(vRowUv6),
			clampToBorder(vRowUv8)
		);
	color += weight.x * texture2D(inputBuffer, vec2(vCenterUv1));
	color += weight.y * texture2D(inputBuffer, vec2(vCenterUv2));
	color += weight.z * texture2D(inputBuffer, vec2(vCenterUv3));
	color += weight.w * texture2D(inputBuffer, vec2(vCenterUv4));

	float l = luminance(color.rgb);
	float scale = saturate(smoothstep(thresholdLevel, thresholdLevel + thresholdRange, l));
	gl_FragColor = color * scale;

	#include <colorspace_fragment>

}
