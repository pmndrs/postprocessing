describe("Post Processing", function() {

	describe("Passes", function() {

		describe("Sanity checks", function() {

			it("define a dispose method", function() {

				assert(typeof POSTPROCESSING.Pass.prototype.dispose === "function");

			});

			it("can all be created and destroyed", function() {

				//var x = new POSTPROCESSING.AdaptiveToneMappingPass();
				//assert(typeof x === "object");
				//x.dispose();

				var x = new POSTPROCESSING.BloomPass();
				assert(typeof x === "object");
				x.dispose();

				//x = new POSTPROCESSING.BokehPass();
				//assert(typeof x === "object");
				//x.dispose();

				x = new POSTPROCESSING.ClearMaskPass();
				assert(typeof x === "object");
				x.dispose();

				x = new POSTPROCESSING.DotScreenPass();
				assert(typeof x === "object");
				x.dispose();

				x = new POSTPROCESSING.FilmPass();
				assert(typeof x === "object");
				x.dispose();

				x = new POSTPROCESSING.GlitchPass();
				assert(typeof x === "object");
				x.dispose();

				x = new POSTPROCESSING.GodRaysPass();
				assert(typeof x === "object");
				x.dispose();

				x = new POSTPROCESSING.MaskPass();
				assert(typeof x === "object");
				x.dispose();

				x = new POSTPROCESSING.RenderPass();
				assert(typeof x === "object");
				x.dispose();

				x = new POSTPROCESSING.SavePass();
				assert(typeof x === "object");
				x.dispose();

				x = new POSTPROCESSING.ShaderPass();
				assert(typeof x === "object");
				x.dispose();

				x = new POSTPROCESSING.TexturePass();
				assert(typeof x === "object");
				x.dispose();

			});

		});

		describe("Memory Management", function() {

			it("should find and destroy all disposable properties", function() {

				var x = new POSTPROCESSING.GlitchPass();

				var i, p, c;
				var keys = Object.keys(x);

				x.dispose();

				for(i = keys.length - 1, c = 0; i >= 0; --i) {

					p = x[keys[i]];
					if(p === null) { ++c; }

				}

				assert(c === 2);

			});

		});

	});

});
