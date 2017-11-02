"use strict";

const SMAABlendMaterial = require("../../build/postprocessing").SMAABlendMaterial;

module.exports = {

	"SMAABlend": {

		"can be created": function(test) {

			const material = new SMAABlendMaterial();
			test.ok(material);
			test.done();

		}

	}

};
