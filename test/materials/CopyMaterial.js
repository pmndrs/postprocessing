"use strict";

const CopyMaterial = require("../../build/postprocessing").CopyMaterial;

module.exports = {

	"Copy": {

		"can be created": function(test) {

			const material = new CopyMaterial();
			test.ok(material);
			test.done();

		}

	}

};
