uniform sampler2D tDiffuse;
uniform sampler2D tGodRays;
uniform float intensity;

varying vec2 vUv;

void main() {

	gl_FragColor = texture2D(tDiffuse, vUv) + intensity * texture2D(tGodRays, vUv);

}
