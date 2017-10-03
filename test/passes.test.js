"use strict";

const lib = require("../build/postprocessing");

module.exports = {

	"Passes": {

		"define a dispose method": function(test) {

			test.equal(typeof lib.Pass.prototype.dispose, "function");
			test.done();

		}

	},

	"Bloom": {

		"can be created and destroyed": function(test) {

			const pass = new lib.BloomPass();
			test.ok(pass);
			pass.dispose();
			test.done();

		}

	},

	"Blur": {

		"can be created and destroyed": function(test) {

			const pass = new lib.BlurPass();
			test.ok(pass);
			pass.dispose();
			test.done();

		}

	},

	"Bokeh": {

		"can be created and destroyed": function(test) {

			const pass = new lib.BokehPass();
			test.ok(pass);
			pass.dispose();
			test.done();

		}

	},

	"Bokeh 2": {

		"can be created and destroyed": function(test) {

			const pass = new lib.Bokeh2Pass();
			test.ok(pass);
			pass.dispose();
			test.done();

		}

	},

	"Clear": {

		"can be created and destroyed": function(test) {

			const pass = new lib.ClearPass();
			test.ok(pass);
			pass.dispose();
			test.done();

		}

	},

	"ClearMask": {

		"can be created and destroyed": function(test) {

			const pass = new lib.ClearMaskPass();
			test.ok(pass);
			pass.dispose();
			test.done();

		}

	},

	"DotScreen": {

		"can be created and destroyed": function(test) {

			const pass = new lib.DotScreenPass();
			test.ok(pass);
			pass.dispose();
			test.done();

		}

	},

	"Film": {

		"can be created and destroyed": function(test) {

			const pass = new lib.FilmPass();
			test.ok(pass);
			pass.dispose();
			test.done();

		}

	},

	"Glitch": {

		"can be created and destroyed": function(test) {

			const pass = new lib.GlitchPass();
			test.ok(pass);
			pass.dispose();
			test.done();

		},

		"should find and destroy all disposable properties": function(test) {

			const pass = new lib.GlitchPass();
			const keys = Object.keys(pass);

			let c = 0;
			let key;

			pass.dispose();

			for(key of keys) {

				if(pass[key] === null) {

					++c;

				}

			}

			test.equal(c, 2, "the glitch pass should destroy 2 of its properties");
			test.done();

		}

	},

	"GodRays": {

		"can be created and destroyed": function(test) {

			const pass = new lib.GodRaysPass(null, null, null);
			test.ok(pass);
			pass.dispose();
			test.done();

		}

	},

	"Pixelation": {

		"can be created and destroyed": function(test) {

			const pass = new lib.PixelationPass();
			test.ok(pass);
			pass.dispose();
			test.done();

		}

	},

	"Mask": {

		"can be created and destroyed": function(test) {

			const pass = new lib.MaskPass();
			test.ok(pass);
			pass.dispose();
			test.done();

		}

	},

	"Render": {

		"can be created and destroyed": function(test) {

			const pass = new lib.RenderPass();
			test.ok(pass);
			pass.dispose();
			test.done();

		}

	},

	"Save": {

		"can be created and destroyed": function(test) {

			const pass = new lib.SavePass();
			test.ok(pass);
			pass.dispose();
			test.done();

		}

	},

	"ShockWave": {

		"can be created and destroyed": function(test) {

			const pass = new lib.ShockWavePass(null);
			test.ok(pass);
			pass.dispose();
			test.done();

		}

	},

	"SMAA": {

		"can be created and destroyed": function(test) {

			const pass = new lib.SMAAPass(null, null);
			test.ok(pass);
			pass.dispose();
			test.done();

		}

	},

	"Shader": {

		"can be created and destroyed": function(test) {

			const pass = new lib.ShaderPass(null);
			test.ok(pass);
			pass.dispose();
			test.done();

		}

	},

	"ToneMapping": {

		"can be created and destroyed": function(test) {

			const pass = new lib.ToneMappingPass();
			test.ok(pass);
			pass.dispose();
			test.done();

		}

	}

};
