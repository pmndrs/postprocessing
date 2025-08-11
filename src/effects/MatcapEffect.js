
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
                    // vec3 normal = texture2D(normalTexture, uv).xyz * 2. - 1.;
                    vec3 normal = normalVec.xyz * 2. - 1.;
                    // vec3 eye = normalize( vec3( uv * 2. - 1., 1. ) ); 

                    
					float d = readDepth(uv) * 2. - 1.;
					vec4 uvd = vec4(uv * 2. - 1., d, 1.);
					vec4 xyz = camera_projectionMatrixInverse * uvd;
					vec3 eye = vec3(xyz / xyz.w);


                    // vec3 eye = normalize( vec3( modelViewMatrix * vec4( position, 1. ) ) ); 
                    // if(uUseOrthographicCamera) { 
                    //     eye = vec3(0., 0., -1.);
                    // }
                    vec2 vN = get_vN(eye, normal);
                    // return vec3(1., 0., 0.);
                    return texture2D(matcapTextureUniform, vN).rgb; 
                }
				
				// float readDepth(const in vec2 uv). To calculate the view Z based on depth, you can use the predefined function float getViewZ(const in float depth)
				// mat4 normalMatrix = transpose(inverse(modelView));
				// float d = readDepth(uv);
				// vec3 uvd = vec3(uv*0.5 - 0.5, d);
				// vec3 xyz = camera_normalMatrix * uvd;
				// vec2 texel = vec2( 1.0 / resolution.x, 1.0 / resolution.y );
				// float tx0y0 = texture2D( inputBuffer, uv + texel * vec2( -1, -1 ) ).r;
				
				vec3 get_camera_space_coords_mat3 (const in vec2 uv_co) {
					float d = readDepth(uv_co); //  * 2. - 1.;
					vec3 uvd = vec3(uv_co * 2. - 1., d);
					// vec3 uvd = vec3(uv_co * 0.5 - 0.5, readDepth(uv_co));
					// vec3 uvd = vec3(uv_co, readDepth(uv_co));
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
					// return get_camera_space_coords_mat3(uv_co);
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
