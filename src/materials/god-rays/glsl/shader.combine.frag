uniform sampler2D tDiffuse;
uniform sampler2D tGodRays;
uniform float intensity;

varying vec2 vUv;

void main() {

	// Since MeshDepthMaterial renders foreground objects white and background 
	// objects black, the god-rays will be white streaks. Therefore value is inverted 
	// before being combined with tDiffuse.

	gl_FragColor = texture2D(tDiffuse, vUv) + intensity * vec4(1.0 - texture2D(tGodRays, vUv).r);
	gl_FragColor.a = 1.0;

}
