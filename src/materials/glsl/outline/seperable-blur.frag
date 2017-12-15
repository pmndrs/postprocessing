#include <common>

uniform sampler2D colorTexture;
uniform vec2 texSize;
uniform vec2 direction;
uniform float kernelRadius;

varying vec2 vUv;

float gaussianPdf(in float x, in float sigma) {
  return 0.39894 * exp((-0.5 * x * x) / ( sigma * sigma)) / sigma;
}

void main() {
  vec2 invSize = 1.0 / texSize;

  float weightSum = gaussianPdf(0.0, kernelRadius);
  vec3 diffuseSum = texture2D( colorTexture, vUv).rgb * weightSum;

  vec2 delta = direction * invSize * kernelRadius/float(MAX_RADIUS);
  vec2 uvOffset = delta;

  for( int i = 1; i <= MAX_RADIUS; i++ ) {
    float w = gaussianPdf(uvOffset.x, kernelRadius);

    vec3 sample1 = texture2D( colorTexture, vUv + uvOffset).rgb;
    vec3 sample2 = texture2D( colorTexture, vUv - uvOffset).rgb;

    diffuseSum += ((sample1 + sample2) * w);
    weightSum += (2.0 * w);
    uvOffset += delta;
  }

  gl_FragColor = vec4(diffuseSum / weightSum, 1.0);
}
