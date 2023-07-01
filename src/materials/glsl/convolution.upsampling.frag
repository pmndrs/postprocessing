#ifdef FRAMEBUFFER_PRECISION_HIGH

	uniform mediump sampler2D inputBuffer;
	uniform mediump sampler2D supportBuffer;

#else

	uniform lowp sampler2D inputBuffer;
	uniform lowp sampler2D supportBuffer;

#endif

uniform float radius;

varying vec2 vUv;
varying vec2 vUv0;
varying vec2 vUv1;
varying vec2 vUv2;
varying vec2 vUv3;
varying vec2 vUv4;
varying vec2 vUv5;
varying vec2 vUv6;
varying vec2 vUv7;

void main() {

	vec4 c = vec4(0.0);

	c += texture2D(inputBuffer, vUv0) * 0.0625;
	c += texture2D(inputBuffer, vUv1) * 0.125;
	c += texture2D(inputBuffer, vUv2) * 0.0625;
	c += texture2D(inputBuffer, vUv3) * 0.125;
	c += texture2D(inputBuffer, vUv) * 0.25;
	c += texture2D(inputBuffer, vUv4) * 0.125;
	c += texture2D(inputBuffer, vUv5) * 0.0625;
	c += texture2D(inputBuffer, vUv6) * 0.125;
	c += texture2D(inputBuffer, vUv7) * 0.0625;

	vec4 baseColor = texture2D(supportBuffer, vUv);
	gl_FragColor = mix(baseColor, c, radius);

	#include <colorspace_fragment>

}
