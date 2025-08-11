
import { Effect, EffectAttribute } from 'postprocessing';
import { Uniform } from 'three';

// https://github.com/pmndrs/postprocessing/wiki/Custom-Effects#depth
export class ScreenSpaceNormalEffect extends Effect {

	constructor( maskTexture, camera ) {

		// Good references:
		// https://wickedengine.net/2019/09/22/improved-normal-reconstruction-from-depth/
		// https://atyuwen.github.io/posts/normal-reconstruction/
		// https://www.shadertoy.com/view/fsVczR

		super(
			'ScreenSpaceNormalEffect',
			/* glsl */ `
				uniform sampler2D maskTexture;
				uniform mat3 camera_normalMatrix;
				uniform mat4 camera_projectionMatrixInverse;
				// uniform vec3 test;
				// uniform float testt;
				// uniform mat3 camera_normalMatrix_inv;
				// uniform mat4 camera_modelViewMatrix;
				// uniform mat4 camera_modelViewMatrix_inv;
				// uniform mat4 camera_matrixWorldInverse;
				// uniform mat4 camera_matrixWorld;
				
				
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
				// Working?
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

				vec3 get_normal_simple(const in vec2 uv_co) {
					// https://wickedengine.net/2019/09/22/improved-normal-reconstruction-from-depth/
					vec3 xyz = get_camera_space_coords (uv_co);
					vec3 xyz_right =  get_camera_space_coords (uv_co + texelSize * vec2(1., 0.));
					vec3 xyz_up =  get_camera_space_coords (uv_co + texelSize * vec2(0., 1.));
					vec3 norm = normalize(cross(xyz_right - xyz, xyz_up - xyz));
					return norm;
				}
				
				vec3 get_normal_besttri(const in vec2 uv_co) {
					// https://wickedengine.net/2019/09/22/improved-normal-reconstruction-from-depth/
					vec3 xyz = get_camera_space_coords (uv_co);
					
					float d_center = readDepth(uv_co);

					vec2 uv_right = uv_co + texelSize * vec2(1., 0.);
					vec2 uv_left = uv_co + texelSize * vec2(-1., 0.);
					vec2 uv_up = uv_co + texelSize * vec2(0., 1.);
					vec2 uv_down = uv_co + texelSize * vec2(0., -1.);

					vec3 xyz_right = get_camera_space_coords (uv_right);
					vec3 xyz_left = get_camera_space_coords (uv_left);
					vec3 xyz_up = get_camera_space_coords (uv_up);
					vec3 xyz_down = get_camera_space_coords (uv_down);

					vec3 xyz_1, xyz_2; // rather than horiz/verti, suffix 1 and 2 which should always be in winding order
					if (abs(readDepth(uv_right) - d_center) < abs(readDepth(uv_left) - d_center)) {
						
						if ( abs(readDepth(uv_up) - d_center) < abs(readDepth(uv_down) - d_center)) {
							xyz_1 = xyz_right;
							xyz_2 = xyz_up;
						} else {
							xyz_2 = xyz_right;
							xyz_1 = xyz_down;
						}
					} else {
						if ( abs(readDepth(uv_up) - d_center) < abs(readDepth(uv_down) - d_center)) {
							xyz_2 = xyz_left;
							xyz_1 = xyz_up;
						} else {
							xyz_1 = xyz_left;
							xyz_2 = xyz_down;
						}
					}
					vec3 norm = normalize(cross(xyz_1 - xyz, xyz_2 - xyz));
					return norm;
				}

				vec3 get_normal_accurate_bad_bands(const in vec2 uv_co) {
					// https://atyuwen.github.io/posts/normal-reconstruction/
					// Also see https://www.shadertoy.com/view/fsVczR
					// Try reconstructing normal accurately from depth buffer.
					// input DepthBuffer: stores linearized depth in range (0, 1).
					// 5 taps on each direction: | z | x | * | y | w |, '*' denotes the center sample.
					
					// Say if your want caculate depth at | * | from taps | z | x |, let A = depth at | * |, B = depth at | z |, C = depth at | x |, we have:
					// 1 / C = 0.5 * (1 / A + 1 / B); // perspective correct interpolation
					// Solve A from above equation we get: A = C * B / (2 * B - C);
					
					float depth = readDepth(uv_co); // c0


					
					// float dl = abs(l1*l2/(2.0*l2-l1)-c0);
					// float dr = abs(r1*r2/(2.0*r2-r1)-c0);
					// float db = abs(b1*b2/(2.0*b2-b1)-c0);
					// float dt = abs(t1*t2/(2.0*t2-t1)-c0);
					// vec3 dpdx = (dl<dr) ?  get_camera_space_coords ( uv_co )- get_camera_space_coords ( uv_co + texelSize * vec2(-1., 0.) ) : 
					// 					- get_camera_space_coords ( uv_co )+ get_camera_space_coords ( uv_co + texelSize * vec2(+1., 0.) ) ;

					vec4 H;
					H.x = readDepth(uv_co + texelSize * vec2(-1., 0.)); // L1
					H.y = readDepth(uv_co + texelSize * vec2(+1., 0.)); // R1
					H.z = readDepth(uv_co + texelSize * vec2(-2., 0.)); // L2
					H.w = readDepth(uv_co + texelSize * vec2(+2., 0.)); // R2
					// DL = abs(l1*l2/(2.0*l2-l1)-c0);
					// DL = abs(H.x * H.z / (2.0 * H.z - H.x) - depth);
					// DR = abs(r1*r2/(2.0*r2-r1)-c0);
					// DR = abs(H.y * H.w / (2.0 * H.w - H.y) - depth);
					vec2 he = abs(H.xy * H.zw / (2. * H.zw - H.xy) - depth);
					vec3 hDeriv;
					// if (he.x <= he.y) 
					// if (abs(he.x - he.y) > 0.0001) 
					if (he.x > he.y) 
						// hDeriv = Calculate horizontal derivative of world position from taps | * | y |
						// hDeriv = posY - posCenter;
						hDeriv = get_camera_space_coords ( uv_co ) - get_camera_space_coords ( uv_co + texelSize * vec2(-1., 0.) );
					else
						// hDeriv = Calculate horizontal derivative of world position from taps | x | * |
						hDeriv = - get_camera_space_coords ( uv_co ) + get_camera_space_coords ( uv_co + texelSize * vec2(+1., 0.) );

					vec4 V;
					V.x = readDepth(uv_co + texelSize * vec2( 0., -1.));
					V.y = readDepth(uv_co + texelSize * vec2( 0., +1.));
					V.z = readDepth(uv_co + texelSize * vec2( 0., -2.));
					V.w = readDepth(uv_co + texelSize * vec2( 0., +2.));
					vec2 ve = abs(V.xy * V.zw / (2. * V.zw - V.xy) - depth);
					vec3 vDeriv;
					// if (ve.x > ve.y)
					if (abs(ve.y - ve.x) > 0.0001)
						// vDeriv = Calculate vertical derivative of world position from taps | * | y |
						hDeriv = get_camera_space_coords (uv_co + texelSize * vec2(0., +1.)) - get_camera_space_coords ( uv_co );
					else
						// vDeriv = Calculate vertical derivative of world position from taps | x | * |
						vDeriv = get_camera_space_coords ( uv_co ) - get_camera_space_coords ( uv_co + texelSize * vec2(0., -1.) );

					return normalize(cross(hDeriv, vDeriv));
					// return normalize(hDeriv);
				}

				vec3 get_normal_accurate_iq(const in vec2 uv_co) {
					// https://atyuwen.github.io/posts/normal-reconstruction/
					// Also see https://www.shadertoy.com/view/fsVczR
					// Try reconstructing normal accurately from depth buffer.
					// input DepthBuffer: stores linearized depth in range (0, 1).
					// 5 taps on each direction: | z | x | * | y | w |, '*' denotes the center sample.
					
					// Say if your want caculate depth at | * | from taps | z | x |, let A = depth at | * |, B = depth at | z |, C = depth at | x |, we have:
					// 1 / C = 0.5 * (1 / A + 1 / B); // perspective correct interpolation
					// Solve A from above equation we get: A = C * B / (2 * B - C);
					
					float depth = readDepth(uv_co); // c0

					float c0 = readDepth(uv_co);
					float l2 = readDepth(uv_co + texelSize * vec2(-2., 0.));
					float l1 = readDepth(uv_co + texelSize * vec2(-1., 0.));
					float r1 = readDepth(uv_co + texelSize * vec2(+1., 0.));
					float r2 = readDepth(uv_co + texelSize * vec2(+2., 0.));
					float b2 = readDepth(uv_co + texelSize * vec2(0., -2.));
					float b1 = readDepth(uv_co + texelSize * vec2(0., -1.));
					float t1 = readDepth(uv_co + texelSize * vec2(0., +1.));
					float t2 = readDepth(uv_co + texelSize * vec2(0., +2.));
					
					float dl = abs(l1*l2/(2.0*l2-l1)-c0);
					float dr = abs(r1*r2/(2.0*r2-r1)-c0);
					float db = abs(b1*b2/(2.0*b2-b1)-c0);
					float dt = abs(t1*t2/(2.0*t2-t1)-c0);
					
					vec3 ce = get_camera_space_coords ( uv_co );

					vec3 dpdx = (dl<dr) ?  ce - get_camera_space_coords ( uv_co + texelSize * vec2(-1., 0.) ) : 
										- ce + get_camera_space_coords ( uv_co + texelSize * vec2(+1., 0.) ) ;
					vec3 dpdy = (db<dt) ?  ce - get_camera_space_coords ( uv_co + texelSize * vec2(0., -1.) ) : 
										-ce +get_camera_space_coords ( uv_co + texelSize * vec2(0., +1.) ) ;

					return normalize(cross(dpdx,dpdy));
					// return normalize(dpdx);
				}


				void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {
					// uniforms.resolution.value.set(width, height);
					// uniforms.texelSize.value.set(1.0 / width, 1.0 / height);
					// v * v is component-wise

					// vec3 norm = get_normal_simple(uv);
					vec3 norm = get_normal_besttri(uv);
					// vec3 norm = get_normal_accurate_bad_bands(uv);
					// vec3 norm = get_normal_accurate_iq(uv);

					// norm = ( camera_matrixWorldInverse * vec4(norm, 0.)).xyz;
					// norm = ( camera_matrixWorld * vec4(norm, 0.)).xyz;
					// norm = (norm + 1.) * 0.5;
					norm = (norm + 0.5);

					outputColor = vec4(norm, 1.);
				}
			`, {

				uniforms: new Map( [
					[ 'maskTexture', new Uniform( maskTexture ) ],
					[ 'camera_normalMatrix', new Uniform( camera.normalMatrix ) ],
					[ 'camera_projectionMatrixInverse', new Uniform( camera.projectionMatrixInverse ) ],

				] ),
				attributes: EffectAttribute.CONVOLUTION | EffectAttribute.DEPTH

			}
		);

	}

}
