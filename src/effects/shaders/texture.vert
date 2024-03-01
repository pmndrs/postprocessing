uniform mat3 uvTransform;

out vec2 vUv2;

void mainSupport(const in vec2 uv) {

	vUv2 = (uvTransform * vec3(uv, 1.0)).xy;

}
