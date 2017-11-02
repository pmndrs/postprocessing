"use strict";

const ConvolutionMaterial = require("../../build/postprocessing").ConvolutionMaterial;

module.exports = {

	"Convolution": {

		"can be created": function(test) {

			const material = new ConvolutionMaterial();
			test.ok(material);
			test.done();

		}

	}

};
