"use strict";

const OutlineBlendMaterial = require("../../build/postprocessing").OutlineBlendMaterial;

module.exports = {

	"Outline Blend": {

		"can be created": function(test) {

			const material = new OutlineBlendMaterial();
			test.ok(material);
			test.done();

		}

	}

};
