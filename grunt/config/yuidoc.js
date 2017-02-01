module.exports = {

	compile: {
		name: "<%= package.name %>",
		description: "<%= package.description %>",
		version: "<%= package.version %>",
		url: "<%= package.homepage %>",
		options: {
			paths: "src",
			outdir: "docs"
		}
	}

};
