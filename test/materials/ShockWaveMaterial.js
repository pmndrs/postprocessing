"use strict";

const ShockWaveMaterial = require("../../build/postprocessing").ShockWaveMaterial;

module.exports = {

	"ShockWave": {

		"can be created": function(test) {

			const material = new ShockWaveMaterial();
			test.ok(material);
			test.done();

		}

	}

};
