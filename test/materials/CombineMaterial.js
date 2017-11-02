"use strict";

const CombineMaterial = require("../../build/postprocessing").CombineMaterial;

module.exports = {

	"Combine": {

		"can be created": function(test) {

			const material = new CombineMaterial();
			test.ok(material);
			test.done();

		}

	}

};
