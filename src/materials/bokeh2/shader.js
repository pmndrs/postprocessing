let fs = require("fs");

let shader = {
	fragment: fs.readFileSync(__dirname + "/glsl/shader.frag", "utf-8"),
	vertex: fs.readFileSync(__dirname + "/glsl/shader.vert", "utf-8")
};
