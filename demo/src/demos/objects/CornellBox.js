import {
	AmbientLight,
	BoxBufferGeometry,
	DirectionalLight,
	Group,
	Mesh,
	MeshPhongMaterial,
	PlaneBufferGeometry,
	PointLight,
	SphereBufferGeometry
} from "three";

/**
 * Creates lights.
 *
 * @private
 * @return {Array} The lights.
 */

function createLights() {

	const ambientLight = new AmbientLight(0x160d03);

	const lightCeiling = new PointLight(0xffc370, 1.0, 25);
	lightCeiling.position.set(0, 9.3, 0);
	lightCeiling.castShadow = true;
	lightCeiling.shadow.mapSize.width = 1024;
	lightCeiling.shadow.mapSize.height = 1024;

	const lightRed = new DirectionalLight(0xff0000, 0.05);
	lightRed.position.set(-10, 0, 0);
	lightRed.target.position.set(0, 0, 0);

	const lightGreen = new DirectionalLight(0x00ff00, 0.05);
	lightGreen.position.set(10, 0, 0);
	lightGreen.target.position.set(0, 0, 0);

	return [lightCeiling, lightRed, lightGreen, ambientLight];

}

/**
 * Creates the cornell box environment.
 *
 * @private
 * @return {Group} The cornell box environment.
 */

function createEnvironment() {

	const environment = new Group();
	const shininess = 5;

	const planeGeometry = new PlaneBufferGeometry();
	const planeMaterial = new MeshPhongMaterial({
		color: 0xffffff,
		shininess
	});

	const plane00 = new Mesh(planeGeometry, planeMaterial);
	const plane01 = new Mesh(planeGeometry, planeMaterial);
	const plane02 = new Mesh(planeGeometry, planeMaterial);
	const plane03 = new Mesh(planeGeometry, planeMaterial);
	const plane04 = new Mesh(planeGeometry, planeMaterial);

	plane00.position.y = -10;
	plane00.rotation.x = Math.PI * 0.5;
	plane00.scale.set(20, 20, 1);

	plane01.position.y = -10;
	plane01.rotation.x = Math.PI * -0.5;
	plane01.scale.set(20, 20, 1);
	plane01.receiveShadow = true;

	plane02.position.y = 10;
	plane02.rotation.x = Math.PI * 0.5;
	plane02.scale.set(20, 20, 1);
	plane02.receiveShadow = true;

	plane03.position.z = -10;
	plane03.scale.set(20, 20, 1);
	plane03.receiveShadow = true;

	plane04.position.z = 10;
	plane04.rotation.y = Math.PI;
	plane04.scale.set(20, 20, 1);
	plane04.receiveShadow = true;

	const plane05 = new Mesh(
		planeGeometry,
		new MeshPhongMaterial({
			color: 0xff0000,
			shininess
		})
	);

	const plane06 = new Mesh(
		planeGeometry,
		new MeshPhongMaterial({
			color: 0x00ff00,
			shininess
		})
	);

	const plane07 = new Mesh(
		planeGeometry,
		new MeshPhongMaterial({
			color: 0xffffff,
			emissive: 0xffffff,
			shininess
		})
	);

	plane05.position.x = -10;
	plane05.rotation.y = Math.PI * 0.5;
	plane05.scale.set(20, 20, 1);
	plane05.receiveShadow = true;

	plane06.position.x = 10;
	plane06.rotation.y = Math.PI * -0.5;
	plane06.scale.set(20, 20, 1);
	plane06.receiveShadow = true;

	plane07.position.y = 10 - 1e-2;
	plane07.rotation.x = Math.PI * 0.5;
	plane07.scale.set(4, 4, 1);

	environment.add(
		plane00, plane01, plane02, plane03,
		plane04, plane05, plane06, plane07
	);

	return environment;

}

/**
 * Creates the cornell box actors.
 *
 * @private
 * @return {Group} The cornell box actors.
 */

function createActors() {

	const actors = new Group();
	const shininess = 5;

	const actorMaterial = new MeshPhongMaterial({
		color: 0xffffff,
		shininess
	});

	const box01 = new Mesh(new BoxBufferGeometry(1, 1, 1), actorMaterial);
	const box02 = new Mesh(new BoxBufferGeometry(1, 1, 1), actorMaterial);
	const sphere01 = new Mesh(new SphereBufferGeometry(1, 32, 32), actorMaterial);

	box01.position.set(-3.5, -4, -3);
	box01.rotation.y = Math.PI * 0.1;
	box01.scale.set(6, 12, 6);
	box01.castShadow = true;

	box02.position.set(3.5, -7, 3);
	box02.rotation.y = Math.PI * -0.1;
	box02.scale.set(6, 6, 6);
	box02.castShadow = true;

	sphere01.position.set(-5, -7, 6);
	sphere01.scale.set(3, 3, 3);
	sphere01.castShadow = true;

	actors.add(box01, box02, sphere01);

	return actors;

}

/**
 * A cornell box.
 */

export class CornellBox {

	/**
	 * Creates lights.
	 *
	 * @return {Array} The lights.
	 */

	static createLights() {

		return createLights();

	}

	/**
	 * Creates the cornell box environment.
	 *
	 * @return {Group} The cornell box environment.
	 */

	static createEnvironment() {

		return createEnvironment();

	}

	/**
	 * Creates the cornell box actors.
	 *
	 * @return {Group} The cornell box actors.
	 */

	static createActors() {

		return createActors();

	}

}
