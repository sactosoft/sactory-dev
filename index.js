var gulp = require("gulp");
var babel = require("gulp-babel");
var clone = require("gulp-clone");
var nop = require("gulp-nop");
var rename = require("gulp-rename");
var sactory = require("gulp-sactory");
var sourcemaps = require("gulp-sourcemaps");
var es = require("event-stream");

function impl(name, exclude, options) {

	options.namespace = name;
	
	return () => {

		var main = gulp.src("./src/*.jsb")
			.pipe(sourcemaps.init())
			.pipe(sactory({
				versionCheck: false,
				mode: "auto-code@logic,trimmed",
				env: ["amd", "commonjs", "none"],
				dependencies: {
					Sactory: {
						none: "Sactory",
						amd: "sactory",
						commonjs: "sactory"
					}
				},
				...options
			}));

		var a = main.pipe(clone())
			.pipe(rename(`sactory-${name}.js`))
			.pipe(sourcemaps.write("."))
			.pipe(gulp.dest("dist"));

		var b = main.pipe(clone())
			.pipe(babel({
				presets: [
					["babel-preset-env", {
						modules: false
					}], ["babel-preset-minify", {
						builtIns: false,
						mangle: {exclude}
					}]
				],
				minified: true,
				comments: false
			}))
			.pipe(rename(`sactory-${name}.min.js`))
			.pipe(sourcemaps.write("."))
			.pipe(gulp.dest("dist"));

		return es.merge(a, b).pipe(nop());

	};

}

function plugin(name, exclude, options = {}) {
	return impl(name, exclude, {
		globalExport: "Sactory." + name,
		...options
	});
}

function widget(name, className, options = {}) {
	return impl("widget-" + name, [className], {
		globalExport: className,
		...options
	});
}

module.exports = { plugin, widget };
