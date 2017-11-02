"use strict";

const GlitchMaterial = require("../../build/postprocessing").GlitchMaterial;

module.exports = {

	"Glitch": {

		"can be created": function(test) {

			const material = new GlitchMaterial();
			test.ok(material);
			test.done();

		}

	}

};
