import {
	Box3,
	BoxGeometry,
	Group,
	InstancedMesh,
	Matrix4,
	MeshStandardMaterial,
	Quaternion,
	Sphere,
	Texture,
	Vector3
} from "three";

/**
 * Creates lights.
 *
 * @return The lights.
 */

export function createLights(): Group {

	const lights = new Group();
	return lights;

}

/**
 * Creates the environment.
 *
 * @param envMap - An environment map.
 * @return The environment.
 */

export function createEnvironment(envMap: Texture | null): Group {

	const environment = new Group();
	const material = new MeshStandardMaterial({
		color: 0xc1c1c1,
		roughness: 0.0,
		metalness: 1.0,
		envMap
	});

	const m = new Matrix4();
	const s = new Vector3();
	const p = new Vector3();
	const q = new Quaternion();

	q.identity();

	// Total instances = n * n * 2 * 16
	// Total triangles = instances * 12

	const n = 12;
	const clusterSizeXZ = 24;
	const instanceSizeXZ = clusterSizeXZ / n;
	const instanceHeight = 10;
	const clearance = 0.3;

	const geometry = new BoxGeometry(1, 1, 1);
	geometry.boundingSphere = new Sphere();
	geometry.boundingBox = new Box3();
	geometry.boundingBox.min.set(0, -instanceHeight, 0);
	geometry.boundingBox.max.set(clusterSizeXZ, instanceHeight, clusterSizeXZ);
	geometry.boundingBox.getBoundingSphere(geometry.boundingSphere);

	// 4x4 instance clusters
	for(let i = -2; i < 2; ++i) {

		for(let j = -2; j < 2; ++j) {

			const mesh = new InstancedMesh(geometry, material, n ** 2 * 2);

			// nx2xn instances
			for(let k = 0, x = 0; x < n; ++x) {

				for(let y = -1; y < 1; ++y) {

					for(let z = 0; z < n; ++z) {

						s.set(instanceSizeXZ, Math.random() * (instanceHeight - clearance), instanceSizeXZ);
						p.set(x * instanceSizeXZ, (y + 0.5) * instanceHeight, z * instanceSizeXZ);
						mesh.setMatrixAt(k++, m.compose(p, q, s));

					}

				}

			}

			mesh.position.set(clusterSizeXZ * i, 0, clusterSizeXZ * j);
			mesh.instanceMatrix.needsUpdate = true;
			mesh.boundingBox = geometry.boundingBox;
			mesh.boundingSphere = geometry.boundingSphere;
			mesh.frustumCulled = true;
			environment.add(mesh);

		}

	}

	return environment;

}

/**
 * Creates the scene actors.
 *
 * @param envMap - An environment map.
 * @return The actors.
 */

export function createActors(envMap: Texture | null): Group {

	const actors = new Group();
	return actors;

}
