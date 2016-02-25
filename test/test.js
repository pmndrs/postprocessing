var lib = require("../build/postprocessing");

module.exports = {

	"a pass defines a dispose method": function(test) {

		test.equals(typeof lib.Pass.prototype.dispose, "function");
		test.done();

	},

	"all passes can be created and destroyed": function(test) {

		//var x = new lib.AdaptiveToneMappingPass();
		//test.equals(typeof x, "object");
		//x.dispose();

		var x = new lib.BloomPass();
		test.equals(typeof x, "object");
		x.dispose();

		//x = new lib.BokehPass();
		//test.equals(typeof x, "object");
		//x.dispose();

		x = new lib.ClearMaskPass();
		test.equals(typeof x, "object");
		x.dispose();

		x = new lib.DotScreenPass();
		test.equals(typeof x, "object");
		x.dispose();

		x = new lib.FilmPass();
		test.equals(typeof x, "object");
		x.dispose();

		x = new lib.GlitchPass();
		test.equals(typeof x, "object");
		x.dispose();

		x = new lib.GodRaysPass();
		test.equals(typeof x, "object");
		x.dispose();

		x = new lib.MaskPass();
		test.equals(typeof x, "object");
		x.dispose();

		x = new lib.RenderPass();
		test.equals(typeof x, "object");
		x.dispose();

		x = new lib.SavePass();
		test.equals(typeof x, "object");
		x.dispose();

		x = new lib.ShaderPass();
		test.equals(typeof x, "object");
		x.dispose();

		test.done();

	},

	"should find and destroy all disposable properties": function(test) {

		var x = new lib.GlitchPass();

		var i, p, c;
		var keys = Object.keys(x);

		x.dispose();

		for(i = keys.length - 1, c = 0; i >= 0; --i) {

			p = x[keys[i]];
			if(p === null) { ++c; }

		}

		test.equals(c, 2);

		test.done();

	}

};
