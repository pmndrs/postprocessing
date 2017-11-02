"use strict";

const GodRaysMaterial = require("../../build/postprocessing").GodRaysMaterial;

module.exports = {

	"GodRays": {

		"can be created": function(test) {

			const material = new GodRaysMaterial();
			test.ok(material);
			test.done();

		}

	}

};
