"use strict";

const lib = require("../build/postprocessing");

module.exports = {

	"Adaptive Luminosity": {

		"can be created": function(test) {

			const material = new lib.AdaptiveLuminosityMaterial();
			test.ok(material);
			test.done();

		}

	},

	"Bokeh": {

		"can be created": function(test) {

			const material = new lib.BokehMaterial();
			test.ok(material);
			test.done();

		}

	},

	"Bokeh 2": {

		"can be created": function(test) {

			const material = new lib.Bokeh2Material();
			test.ok(material);
			test.done();

		}

	},

	"Combine": {

		"can be created": function(test) {

			const material = new lib.CombineMaterial();
			test.ok(material);
			test.done();

		}

	},

	"Convolution": {

		"can be created": function(test) {

			const material = new lib.ConvolutionMaterial();
			test.ok(material);
			test.done();

		}

	},

	"Copy": {

		"can be created": function(test) {

			const material = new lib.CopyMaterial();
			test.ok(material);
			test.done();

		}

	},

	"DotScreen": {

		"can be created": function(test) {

			const material = new lib.DotScreenMaterial();
			test.ok(material);
			test.done();

		}

	},

	"Film": {

		"can be created": function(test) {

			const material = new lib.FilmMaterial();
			test.ok(material);
			test.done();

		}

	},

	"Glitch": {

		"can be created": function(test) {

			const material = new lib.GlitchMaterial();
			test.ok(material);
			test.done();

		}

	},

	"GodRays": {

		"can be created": function(test) {

			const material = new lib.GodRaysMaterial();
			test.ok(material);
			test.done();

		}

	},

	"Luminosity": {

		"can be created": function(test) {

			const material = new lib.LuminosityMaterial();
			test.ok(material);
			test.done();

		}

	},

	"Pixelation": {

		"can be created": function(test) {

			const material = new lib.PixelationMaterial();
			test.ok(material);
			test.done();

		}

	},

	"SMAABlend": {

		"can be created": function(test) {

			const material = new lib.SMAABlendMaterial();
			test.ok(material);
			test.done();

		}

	},

	"SMAAColorEdges": {

		"can be created": function(test) {

			const material = new lib.SMAAColorEdgesMaterial();
			test.ok(material);
			test.done();

		}

	},

	"SMAAWeights": {

		"can be created": function(test) {

			const material = new lib.SMAAWeightsMaterial();
			test.ok(material);
			test.done();

		}

	},

	"ToneMapping": {

		"can be created": function(test) {

			const material = new lib.ToneMappingMaterial();
			test.ok(material);
			test.done();

		}

	}

};
