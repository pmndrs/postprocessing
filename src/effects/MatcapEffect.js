
import { Effect, EffectAttribute } from 'postprocessing';
import { Uniform } from 'three';

export class MatcapEffect extends Effect {

	constructor( matcapTextureUniform, camera ) {

		super(
			'MatcapEffect',
			/* glsl */ `
				uniform mat3 camera_normalMatrix;
				uniform mat4 camera_projectionMatrixInverse;

                uniform sampler2D matcapTextureUniform; 

                // Matcap Material
                vec2 get_vN(const in vec3 eye, const in vec3 normal) {
                    vec3 r_en = reflect( eye, normal ); // or r_en = e - 2. * dot( n, e ) * n;
                    float m = 2. * sqrt(pow( r_en.x, 2. ) + pow( r_en.y, 2. ) + pow( r_en.z + 1., 2. ));
                    vec2 vN = r_en.xy / m + .5;
                    return vN;
                }
                vec3 get_matcap(const in vec2 uv, const in vec4 normalVec) { 
					// Get matcap lookup coords from normal and depth
                    vec3 normal = normalVec.xyz * 2. - 1.;
					float d = readDepth(uv) * 2. - 1.;
					vec4 uvd = vec4(uv * 2. - 1., d, 1.);
					vec4 xyz = camera_projectionMatrixInverse * uvd;
					vec3 eye = vec3(xyz / xyz.w);
                    vec2 vN = get_vN(eye, normal);

					// Read matcap texture at lookup position
                    return texture2D(matcapTextureUniform, vN).rgb; 
                }
				
				vec3 get_camera_space_coords_mat3 (const in vec2 uv_co) {
					float d = readDepth(uv_co); //  * 2. - 1.;
					vec3 uvd = vec3(uv_co * 2. - 1., d);
					vec3 xyz = camera_normalMatrix * uvd;
					return xyz;
				}
				 
				vec3 get_camera_space_coords_mat4 (const in vec2 uv_co) {
					float d = readDepth(uv_co) * 2. - 1.;
					vec4 uvd = vec4(uv_co * 2. - 1., d, 1.);
					vec4 xyz = camera_projectionMatrixInverse * uvd;
					return vec3(xyz / xyz.w);
				}

				vec3 get_camera_space_coords (const in vec2 uv_co) {
					return get_camera_space_coords_mat4(uv_co);
				}

				void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {
					// uniforms.resolution.value.set(width, height);
					// uniforms.texelSize.value.set(1.0 / width, 1.0 / height);
					// v * v is component-wise
                    // inputColor should be normal texture, eventually NormalScreenSpace
					outputColor = vec4(get_matcap(uv, inputColor), 1.);
				}
			`, {

				uniforms: new Map( [
					[ 'matcapTextureUniform', new Uniform( matcapTextureUniform ) ],
					[ 'camera_normalMatrix', new Uniform( camera.normalMatrix ) ],
					[ 'camera_projectionMatrixInverse', new Uniform( camera.projectionMatrixInverse ) ],

				] ),
				attributes: EffectAttribute.CONVOLUTION | EffectAttribute.DEPTH

			}
		);

	}

}
