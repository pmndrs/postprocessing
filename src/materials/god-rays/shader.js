var fs = require("fs");

var shader = {
	fragment: {
		generate: fs.readFileSync(__dirname + "/glsl/shader.generate.frag", "utf-8"),
		combine: fs.readFileSync(__dirname + "/glsl/shader.combine.frag", "utf-8")
	},
	vertex: fs.readFileSync(__dirname + "/glsl/shader.vert", "utf-8")
};
