"use strict";

const ToneMappingMaterial = require("../../build/postprocessing").ToneMappingMaterial;

module.exports = {

	"ToneMapping": {

		"can be created": function(test) {

			const material = new ToneMappingMaterial();
			test.ok(material);
			test.done();

		}

	}

};
