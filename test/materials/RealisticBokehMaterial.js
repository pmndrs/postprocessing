"use strict";

const RealisticBokehMaterial = require("../../build/postprocessing").RealisticBokehMaterial;

module.exports = {

	"RealisticBokeh": {

		"can be created": function(test) {

			const material = new RealisticBokehMaterial();
			test.ok(material);
			test.done();

		}

	}

};
