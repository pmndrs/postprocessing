import test from "ava";
import { TextureResource } from "postprocessing";
import { Texture, Uniform } from "three";

test("can be instantiated", t => {

	t.truthy(new TextureResource());

});

test("can bind uniforms", t => {

	const resource = new TextureResource();
	const uniform = new Uniform(null);
	const texture = new Texture();

	resource.bindUniform(uniform);
	resource.value = texture;

	t.is(uniform.value, resource.value);

});

test("can define an override value", t => {

	const texture0 = new Texture();
	const texture1 = new Texture();
	const resource = new TextureResource(texture0);
	resource.overrideValue = texture1;

	t.is(resource.value, texture1);

});
