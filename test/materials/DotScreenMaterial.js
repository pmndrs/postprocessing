"use strict";

const DotScreenMaterial = require("../../build/postprocessing").DotScreenMaterial;

module.exports = {

	"DotScreen": {

		"can be created": function(test) {

			const material = new DotScreenMaterial();
			test.ok(material);
			test.done();

		}

	}

};
