uniform sampler2D maskTexture;
uniform sampler2D edgeTexture1;
uniform sampler2D edgeTexture2;
uniform sampler2D patternTexture;
uniform float edgeStrength;
uniform float edgeGlow;
uniform bool usePatternTexture;

varying vec2 vUv;

void main() {
  vec4 edgeValue1 = texture2D(edgeTexture1, vUv);
  vec4 edgeValue2 = texture2D(edgeTexture2, vUv);
  vec4 maskColor = texture2D(maskTexture, vUv);
  vec4 patternColor = texture2D(patternTexture, 6.0 * vUv);

  float visibilityFactor = (1.0 - maskColor.g) > 0.0 ? 1.0 : 0.5;

  vec4 edgeValue = edgeValue1 + (edgeValue2 * edgeGlow);
  vec4 finalColor = edgeStrength * maskColor.r * edgeValue;

  if(usePatternTexture)
    finalColor += + visibilityFactor * (1.0 - maskColor.r) * (1.0 - patternColor.r);

  gl_FragColor = finalColor;
}
