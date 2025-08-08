/**
 * Octahedron normal vector encoding and decoding.
 *
 * @see https://knarkowicz.wordpress.com/2014/04/16/octahedron-normal-vector-encoding/
 * @see https://aras-p.info/texts/CompactNormalStorage.html
 */

vec2 pp_encodeNormal(vec3 n) {

	n /= (abs(n.x) + abs(n.y) + abs(n.z));
	n.xy = (n.z >= 0.0) ? n.xy : (1.0 - abs(n.yx)) * sign(n.xy);
	return n.xy;

}

vec3 pp_decodeNormal(vec2 f) {

	// https://twitter.com/Stubbesaurus/status/937994790553227264
	vec3 n = vec3(f.x, f.y, 1.0 - abs(f.x) - abs(f.y));
	float t = clamp(-n.z, 0.0, 1.0);
	n.xy += vec2(n.x >= 0.0 ? -t : t, n.y >= 0.0 ? -t : t);
	return normalize(n);

}
