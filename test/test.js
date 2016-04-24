"use strict";

const LIBRARY = require("../build/postprocessing");

module.exports = {

	"Effect Composer": {

		"can be instantiated": function(test) {

			function WebGLRendererMockup() {

				this.getSize = function() { return {width: 1, height: 1}; };

				this.context = {
					getContextAttributes: function() { return {alpha: 0}; },
					depthMask: function() {}
				};

			}

			let composer = new LIBRARY.EffectComposer(new WebGLRendererMockup());
			test.ok(composer, "effect composer");
			composer.dispose();

			test.done();

		}

	},

	"Materials": {

		"can be created": function(test) {

			let material = new LIBRARY.AdaptiveLuminosityMaterial();
			test.ok(material, "adaptive luminosity");

			material = new LIBRARY.BokehMaterial();
			test.ok(material, "bokeh");

			material = new LIBRARY.Bokeh2Material();
			test.ok(material, "bokeh 2");

			material = new LIBRARY.CombineMaterial();
			test.ok(material, "combine");

			material = new LIBRARY.ConvolutionMaterial();
			test.ok(material, "convolution");

			material = new LIBRARY.CopyMaterial();
			test.ok(material, "copy");

			material = new LIBRARY.DotScreenMaterial();
			test.ok(material, "dot screen");

			material = new LIBRARY.FilmMaterial();
			test.ok(material, "film");

			material = new LIBRARY.GlitchMaterial();
			test.ok(material, "glitch");

			material = new LIBRARY.GodRaysMaterial();
			test.ok(material, "god rays");

			material = new LIBRARY.LuminosityMaterial();
			test.ok(material, "luminosity");

			material = new LIBRARY.SMAABlendMaterial();
			test.ok(material, "smaa blend");

			material = new LIBRARY.SMAAColorEdgesMaterial();
			test.ok(material, "smaa color edges");

			material = new LIBRARY.SMAAWeightsMaterial();
			test.ok(material, "smaa weights");

			material = new LIBRARY.ToneMappingMaterial();
			test.ok(material, "tone mapping");

			test.done();

		}

	},

	"Passes": {

		"define a dispose method": function(test) {

			test.equal(typeof LIBRARY.Pass.prototype.dispose, "function");
			test.done();

		},

		"can be created and destroyed": function(test) {

			let pass = new LIBRARY.BloomPass();
			test.ok(pass, "bloom");
			pass.dispose();

			pass = new LIBRARY.BokehPass();
			test.ok(pass, "bokeh");
			pass.dispose();

			pass = new LIBRARY.Bokeh2Pass();
			test.ok(pass, "bokeh 2");
			pass.dispose();

			pass = new LIBRARY.ClearMaskPass();
			test.ok(pass, "clear mask");
			pass.dispose();

			pass = new LIBRARY.DotScreenPass();
			test.ok(pass, "dot screen");
			pass.dispose();

			pass = new LIBRARY.FilmPass();
			test.ok(pass, "film");
			pass.dispose();

			pass = new LIBRARY.GlitchPass();
			test.ok(pass, "glitch");
			pass.dispose();

			pass = new LIBRARY.GodRaysPass();
			test.ok(pass, "god rays");
			pass.dispose();

			pass = new LIBRARY.MaskPass();
			test.ok(pass, "mask");
			pass.dispose();

			pass = new LIBRARY.RenderPass();
			test.ok(pass, "render");
			pass.dispose();

			pass = new LIBRARY.SavePass();
			test.ok(pass, "save ");
			pass.dispose();

			pass = new LIBRARY.SMAAPass(function Image() {});
			test.ok(pass, "smaa");
			pass.dispose();

			pass = new LIBRARY.ShaderPass();
			test.ok(pass, "shader");
			pass.dispose();

			pass = new LIBRARY.ToneMappingPass();
			test.ok(pass, "tone mapping");
			pass.dispose();

			test.done();

		},

		"should find and destroy all disposable properties": function(test) {

			let pass = new LIBRARY.GlitchPass();

			let i, p, c;
			let keys = Object.keys(pass);

			pass.dispose();

			for(i = keys.length - 1, c = 0; i >= 0; --i) {

				p = pass[keys[i]];
				if(p === null) { ++c; }

			}

			test.equal(c, 2, "the glitch pass should destroy 2 of its properties");

			test.done();

		}

	}

};
