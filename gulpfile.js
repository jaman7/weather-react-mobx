/* eslint-disable no-prototype-builtins */
/* eslint-disable no-restricted-syntax */
const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('autoprefixer');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const JpegRecompress = require('imagemin-jpeg-recompress');
const gifsicle = require('imagemin-gifsicle');
const svgo = require('imagemin-svgo');
const size = require('gulp-size');
const del = require('del');
const jshint = require('gulp-jshint');
const notify = require('gulp-notify');
const prettyError = require('gulp-prettyerror');
const plumber = require('gulp-plumber');
const fancylog = require('fancy-log');
const c = require('ansi-colors');
const beeper = require('beeper');
const postcss = require('gulp-postcss');
const sorting = require('postcss-sorting');
const stripDebug = require('gulp-strip-debug');
const postcssMergeRules = require('postcss-merge-rules');
const flexbugsFixes = require('postcss-flexbugs-fixes');
const rjs = require('requirejs');
const rev = require('gulp-rev');
const revReplace = require('gulp-rev-replace');
const rename = require('gulp-rename');
const jsonlint = require('gulp-jsonlint');
const insertLines = require('gulp-insert-lines');
const moment = require('moment');
const header = require('gulp-header');

const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const eslint = require('gulp-eslint');
const babel = require('gulp-babel');
const webpack = require('webpack');
const webpackstream = require('webpack-stream');
const named = require('vinyl-named');
const through = require('through2');

const htmlReaplce = require('gulp-html-replace');
const htmlMin = require('gulp-htmlmin');

const purgeSourcemaps = require('gulp-purge-sourcemaps');
const cleanCSS = require('gulp-clean-css');
const print = require('gulp-print').default;
const phpcs = require('gulp-phpcs');
const shell = require('gulp-shell');
const webpackconfig = require('./webpack.config.js');
const zensorting = require('./zen.json');
const pkg = require('./package.json');

// const newer = require('gulp-newer');
// twig
// const twig = require('gulp-twig');

// =====================================================================//

const banner = [
	'/**',
	' * @project        <%= pkg.name %>',
	' * @author         <%= pkg.author %>',
	` * @build          ${moment().format('llll')} ET`,
	` * @copyright      Copyright (c) ${moment().format('YYYY')}, <%= pkg.copyright %>`,
	' *',
	' */',
	''
].join('\n');

// dirs
const dist = './dist/';
const src = './src/';
const mapout = '/';
const distphpdir = `${dist}inc/`;
const localurl = pkg.repository.directory;

// src dist config
const config = {
	scssin: `${src}scss/**/*.scss`,
	cleanscssdist: `${dist}scss/`,
	cleanscssdistBS: `${dist}css/bootstrap/`,
	cssin: `${src}css/**/*.css`,
	cssout: `${src}css/`,
	distcss: `${dist}css/`,
	diststylefile: `${dist}**/style.css`,
	jsin: [`${src}js/**/*.js`, `!${src}js/vendor/**/*`, `!${src}js/${pkg.name}.js`],
	jsxin: `${src}jsx/**/*.jsx`,
	jsxout: `${src}js/`,
	jsout: `${dist}js/`,
	htmlin: `${src}**/*.html`,
	phpin: [`${src}**/*.php`, `!${src}vendor/**`],
	jsonin: `${src}**/*.json`,
	fontin: `${src}fonts/**/*`,
	fontout: `${dist}fonts/`,
	imgin: `${src}img/**/*.{jpg,jpeg,png,gif}`,
	imgin2: `${src}img/**/*.{jpg,jpeg,png}`,
	imgout: `${dist}img/`,
	cssnamemin: 'style.min.css',
	jsnamemin: 'script.min.js',
	cssreplaceout: 'css/style.min.css',
	jsreplaceout: 'js/script.min.js',
	revmanifestfile: `${dist}rev-manifest.json`,
	revhead: `${distphpdir}head.php`,
	distindexphp: `${dist}index.php`,
	environment: 'development',
	vendorBin: 'vendor/bin/',
	phpDir: 'src/inc/',
	phpexclude: `${src}vendor/`
};

// =========================r.js============================================//
const rjsconfig = {
	appDir: 'src/',
	baseUrl: 'js/', // relative to appDir
	dir: 'dist/',
	mainconfigfile: 'src/js/main.js',
	modules: [
		{
			name: 'main',
			include: ['jquery', 'popper', 'bootstrap', 'sample_heros']
		}
	],
	paths: {
		jquery: 'empty:',
		popper: 'jsvendor/popper',
		bootstrap: 'jsvendor/bootstrap',
		sample_heros: 'empty:'
	},
	shim: {
		popper: {
			deps: ['jquery'],
			exports: ['Popper']
		},
		bootstrap: {
			deps: ['jquery', 'popper'],
			exports: ['bootstrap']
		}
	},
	optimize: 'uglify2',
	uglify2: {
		output: {
			beautify: false
		},
		mangle: true
	},
	optimizeCss: 'standard',
	removeCombined: true,
	preserveLicenseComments: false
};

// =========================funckcje============================================//

//= ========================func log============================================//
const log = (msg) => {
	if (typeof msg === 'object') {
		for (const item in msg) {
			if (msg.hasOwnProperty(item)) {
				fancylog(c.blue(msg[item]));
			}
		}
	} else {
		fancylog(c.white(msg));
	}
};

//= ========================func jsonlint============================================//
const jsonlintreporter = (file) => {
	log(`File ${file.path} is not valid JSON.`);
};

//= ========================func error============================================//
const reportError = (error) => {
	const lineNumber = error.lineNumber ? `LINE ${error.lineNumber} -- ` : '';
	notify({
		title: `Task Failed [${error.plugin}]`,
		message: `${lineNumber}See console.`,
		sound: 'Sosumi' // See: https://github.com/mikaelbr/node-notifier#all-notification-options-with-their-defaults
	}).write(error);
	beeper();
	let report = '';
	const chalk = c.white.bgRed;
	report += `${chalk('TASK:')} [${error.plugin}]\n`;
	report += `${chalk('PROB:')} ${error.message}\n`;
	if (error.lineNumber) {
		report += `${chalk('LINE:')} ${error.lineNumber}\n`;
	}
	if (error.fileName) {
		report += `${chalk('FILE:')} ${error.fileName}\n`;
	}
	console.error(report);
	// this.emit('end');
};

//= =========================func plumber error conf==============================//
const onError = (error) => {
	fancylog.error(c.red(error));
	// this.emit('end');
};

// ==============================konfigi============================================//
// =========================Sass options============================================//
const sassOptions = {
	imagePath: '../img',
	errLogToConsole: true,
	outputStyle: 'expanded'
};

// ==========================config css autoprefix sort==============================//
const sortOptions = [
	flexbugsFixes,
	postcssMergeRules,
	autoprefixer({
		overrideBrowserslist: [
			'>= 1%',
			'last 1 major version',
			'not dead',
			'Chrome >= 45',
			'ChromeAndroid >= 61',
			'Firefox >= 38',
			'FirefoxAndroid >= 56',
			'Edge >= 12',
			'IE >= 9',
			'iOS >= 9',
			'Safari >= 9',
			'Android >= 4',
			'Opera >= 30',
			'OperaMobile >= 48'
		],
		cascade: true
	}),
	sorting(zensorting)
];

// ===========================taski produkcja================================//

// ===============================reload=====================================//
const reload = (cb) => {
	browserSync.reload();
	cb();
};
exports.reload = reload;

// ==============================serve=====================================//
const serve = (cb) => {
	browserSync.init({
		port: 3007,
		// server: src,
		notify: false,
		browser: 'Chrome',
		proxy: `localhost/${localurl}/src`,
		ws: true
	});
	cb();
};
exports.serve = serve;
// ================================SASS=========================================//
const sassCompile = (cb) => {
	const s = size();
	log('-> Compile SASS Styles');
	return gulp
		.src(config.scssin)
		.pipe(
			plumber({
				errorHandler: onError
			})
		)
		.pipe(prettyError())
		.pipe(sourcemaps.init())
		.pipe(sass(sassOptions).on('error', reportError))
		.pipe(postcss(sortOptions))
		.pipe(s)
		.pipe(
			header(banner, {
				pkg
			})
		)
		.pipe(sourcemaps.write(mapout))
		.pipe(gulp.dest(config.cssout))
		.pipe(browserSync.stream())
		.pipe(print((filepath) => `CSS opty: ${filepath} -> ${s.prettySize}`))
		.on('end', cb);
};
exports.sassCompile = sassCompile;

// =========================Dist min.css===============================//
const css = (cb) => {
	const s = size();
	log('-> css minify');
	return gulp
		.src(config.cssin)
		.pipe(
			plumber({
				errorHandler: onError
			})
		)
		.pipe(prettyError())
		.pipe(concat(config.cssnamemin))
		.pipe(
			cleanCSS(
				{
					aggressiveMerging: false,
					debug: true,
					compatibility: 'ie9',
					keepSpecialComments: 0
				},
				(details) => {
					log(`${details.name}: ${details.stats.originalSize}`);
					log(`${details.name}: ${details.stats.minifiedSize}`);
				}
			)
		)
		.pipe(s)
		.pipe(purgeSourcemaps())
		.pipe(gulp.dest(config.distcss))
		.pipe(
			notify({
				onLast: true,
				message() {
					return `CSS min: <%= file.relative %> ${s.prettySize}`;
				},
				sound: false
			})
		)
		.on('end', cb);
};
exports.css = css;

// ================================jshint=========================================//
const jslint = (cb) => {
	const s = size();
	log('-> sprawdzanie js');
	return gulp
		.src(config.jsin)
		.pipe(
			plumber({
				errorHandler: onError
			})
		)
		.pipe(stripDebug())
		.pipe(jshint('.jshintrc'))
		.pipe(
			jshint.reporter('jshint-stylish', {
				beep: true
			})
		)
		.pipe(s)
		.pipe(
			notify({
				onLast: true,
				message() {
					return `JS check: <%= file.relative %> ${s.prettySize}`;
				},
				sound: false
			})
		)
		.on('end', cb);
};
exports.jslint = jslint;

const jsx = (cb) => {
	const s = size();
	log('-> sprawdzanie jsx');
	return gulp
		.src(config.jsxin)
		.pipe(
			plumber({
				errorHandler: onError
			})
		)
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(s)
		.pipe(sourcemaps.init())
		.pipe(babel())
		.pipe(concat('main.js'))
		.pipe(uglify())
		.pipe(sourcemaps.write(mapout))
		.pipe(gulp.dest(config.jsxout))
		.pipe(
			notify({
				onLast: true,
				message() {
					return `es5 js opty: <%= file.relative %> ${s.prettySize}`;
				},
				sound: false
			})
		)
		.on('end', cb);
};
exports.jsx = jsx;

const jsx2 = (cb) => {
	const s = size();
	log('-> sprawdzanie jsx');
	return gulp
		.src(config.jsxin)
		.pipe(
			plumber({
				errorHandler: onError
			})
		)
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(s)
		.pipe(named())
		.pipe(webpackstream(webpackconfig, webpack))
		.pipe(
			// eslint-disable-next-line func-names
			through.obj(function (file, enc, done) {
				// Dont pipe through any source map files as it will be handled
				// by gulp-sourcemaps
				const isSourceMap = /\.map$/.test(file.path);
				if (!isSourceMap) this.push(file);
				done();
			})
		)
		.pipe(gulp.dest(config.jsxout))
		.pipe(
			notify({
				onLast: true,
				message() {
					return `es5 js opty: <%= file.relative %> ${s.prettySize}`;
				},
				sound: false
			})
		)
		.on('end', cb);
};
exports.jsx2 = jsx2;

// ================================jsonlint=========================================//
const jsonlinter = (cb) => {
	const s = size();
	log('-> json check');
	return gulp
		.src(config.jsonin)
		.pipe(
			plumber({
				errorHandler: onError
			})
		)
		.pipe(jsonlint())
		.pipe(jsonlint.reporter(jsonlintreporter))
		.pipe(s)
		.pipe(
			notify({
				onLast: true,
				message() {
					return `JS check: <%= file.relative %> ${s.prettySize}`;
				},
				sound: false
			})
		)
		.on('end', cb);
};
exports.jsonlinter = jsonlinter;

// =========================taski bulid wps + rj.s========================//

//= =============================clean====================================//
const clean = (cb) => {
	log('-> Cleaning build folder');
	return del([dist], cb);
};
exports.clean = clean;

//= ===========================rjsbuild===================================//
const rjsbuild = (cb) => {
	log('-> requirejs optymizer');
	return rjs.optimize(
		rjsconfig,

		(buildResponse) => {
			log('build response', buildResponse);
			cb();
		},

		(error) => {
			fancylog.error('requirejs task failed', JSON.stringify(error));
			process.exit(1);
		},
		cb
	);
};
exports.rjsbuild = rjsbuild;

// ============================clean-image================================//
const cleanImage = (cb) => {
	log('-> Cleaning img files to preoptymize');
	del([`${config.imgout}**/**/*.{jpg,jpeg,png,gif}`]).then(
		(paths) => {
			log(paths);
			cb();
		},
		(reason) => {
			cb(`Failed to delete files ${reason}`); // fail
		}
	);
};
exports.cleanImage = cleanImage;
// ========================IMG compres===================================//
const img = (cb) => {
	let nSrc = 0;
	let nDes = 0;
	log('-> IMG minify');
	return gulp
		.src(config.imgin)
		.on('data', () => {
			nSrc += 1;
		})
		.pipe(
			plumber({
				errorHandler: onError
			})
		)
		.pipe(prettyError())
		.pipe(
			imagemin(
				[
					gifsicle(),
					JpegRecompress({
						progressive: true,
						max: 100,
						min: 70
					}),
					pngquant({
						quality: [0.9, 0.99]
					}),
					svgo({
						plugins: [
							{
								removeViewBox: false
							},
							{
								removeXMLProcInst: false
							},
							{
								removeDoctype: false
							}
						],
						js2svg: {
							pretty: true
						}
					})
				],
				{
					verbose: true
				}
			)
		)
		.pipe(gulp.dest(config.imgout))
		.on('data', () => {
			nDes += 1;
		})
		.on('finish', () => {
			log('Results for img');
			log('# src files: ', nSrc);
			log('# dest files:', nDes);
		})
		.on('end', cb);
};
exports.img = img;

// ========================rev===================================//
const revisionsCss = (cb) => {
	log('-> revisions css style');
	const s = size();
	gulp
		.src([config.diststylefile], { base: dist })
		.pipe(
			plumber({
				errorHandler: onError
			})
		)
		.pipe(s)
		.pipe(rev())
		.pipe(gulp.dest(dist))
		.pipe(rev.manifest())
		.pipe(gulp.dest(dist))
		.pipe(
			notify({
				onLast: true,
				message() {
					return `php rev: <%= file.relative %> ${s.prettySize}`;
				},
				sound: false
			})
		);
	setTimeout(cb, 1000);
};
exports.revisionsCss = revisionsCss;

// ======================revreplace===============================//
const revreplace = (cb) => {
	log('-> Replace in html to revision css');
	const manifest = gulp.src(config.revmanifestfile);
	const s = size();
	gulp
		.src(config.revhead)
		.pipe(
			plumber({
				errorHandler: onError
			})
		)
		.pipe(s)
		.pipe(
			rename({
				extname: '.html'
			})
		)
		.pipe(
			revReplace({
				manifest
			})
		)
		.pipe(
			rename({
				extname: '.php'
			})
		)
		.pipe(gulp.dest(config.revhead))
		.pipe(
			notify({
				onLast: true,
				message() {
					return `php rev replace: <%= file.relative %> ${s.prettySize}`;
				},
				sound: false
			})
		);
	setTimeout(cb, 1000);
};
exports.revreplace = revreplace;
// ======================add lines to minify html in php output===============================//
const insertMninifyHtmlInPHP = (cb) => {
	log('-> add lines to minify html in php output');
	const s = size();
	gulp
		.src(config.distindexphp)
		.pipe(
			plumber({
				errorHandler: onError
			})
		)
		.pipe(s)
		.pipe(
			rename({
				extname: '.html'
			})
		)

		.pipe(insertLines.replace('//outminfyhtml', 'ob_start("sanitize_output");'))

		.pipe(
			rename({
				extname: '.php'
			})
		)
		.pipe(gulp.dest(dist))
		.pipe(
			notify({
				onLast: true,
				message() {
					return `add lines to minify html in php output: <%= file.relative %> ${s.prettySize}`;
				},
				sound: false
			})
		);
	setTimeout(cb, 100);
};
exports.insertMninifyHtmlInPHP = insertMninifyHtmlInPHP;
// ===================clean-dist-map-styles==========================//
const cleanDistMapStyles = (cb) => {
	log('-> Cleaning unsued files');
	del([
		config.cleanscssdist,
		config.cleanscssdistBS,
		`${config.distcss}*.map`,
		config.diststylefile,
		`${dist}*.json`,
		`${config.distcss}*.json`
	]).then(
		(paths) => {
			log(paths);
			cb(); // ok
		},
		(reason) => {
			cb(`Failed to delete files ${reason}`); // fail
		}
	);
};
exports.cleanDistMapStyles = cleanDistMapStyles;

const cleanDistAfter = (cb) => {
	log('-> Cleaning unsued files');
	del([`${config.distcss}*.min.css`]).then(
		(paths) => {
			log(paths);
			cb(); // ok
		},
		(reason) => {
			cb(`Failed to delete files ${reason}`); // fail
		}
	);
};
exports.cleanDistAfter = cleanDistAfter;
// =========================taski bulid no r.js========================//

// ============================Dist min.js==================================//
const buildJS = (cb) => {
	const s = size();
	log('-> JS minify');
	return gulp
		.src(config.jsin)
		.pipe(
			plumber({
				errorHandler: onError
			})
		)
		.pipe(prettyError())
		.pipe(
			sourcemaps.init({
				loadMaps: true
			})
		)
		.pipe(concat(config.jsnamemin))
		.pipe(uglify())
		.pipe(s)
		.pipe(sourcemaps.write(mapout))
		.pipe(gulp.dest(config.jsout))
		.pipe(
			notify({
				onLast: true,
				message() {
					return `JS min: <%= file.relative %> ${s.prettySize}`;
				},
				sound: false
			})
		)
		.on('end', cb);
};
exports.buildJS = buildJS;
// ============================Dist min html==================================//
const html = (cb) => {
	const s = size();
	log('-> html minfy');
	return gulp
		.src(config.htmlin)
		.pipe(s)
		.pipe(
			plumber({
				errorHandler: onError
			})
		)
		.pipe(prettyError())
		.pipe(
			htmlReaplce({
				css: config.cssreplaceout,
				js: config.jsreplaceout
			})
		)
		.pipe(
			htmlMin({
				sortAttributes: true,
				sortClassName: true,
				collapseWhitespace: true
			})
		)
		.pipe(gulp.dest(dist))
		.pipe(
			notify({
				onLast: true,
				message() {
					return `html min: <%= file.relative %> ${s.prettySize}`;
				},
				sound: false
			})
		)
		.on('end', cb);
};
exports.html = html;
// ============================Dist fonts==================================//
const fonts = (cb) => {
	const s = size();
	log('-> font copy dest');
	return gulp
		.src(config.fontin)
		.pipe(s)
		.pipe(gulp.dest(config.fontout))
		.pipe(
			notify({
				onLast: true,
				message() {
					return `FONT out: <%= file.relative %> ${s.prettySize}`;
				}
			})
		)
		.on('end', cb);
};
exports.fonts = fonts;

// *************php sniffer*******************//
const phpcode = (cb) => {
	log('-> php sniffer');
	return gulp
		.src(['src/', '!src/vendor/'])
		.pipe(
			phpcs({
				bin: `${config.vendorBin}phpcs`,
				standard: 'PSR2',
				extensions: 'php',
				warningSeverity: 0
			})
		)
		.pipe(phpcs.reporter('log'))
		.on('end', cb);
};
exports.phpcode = phpcode;

const phpcbf = (cb) => {
	log('-> phpcbf sniffer');
	return gulp
		.src(['src/', '!src/vendor/'])
		.pipe(
			shell(
				[
					`"${config.vendorBin}phpcbf" --standard=PSR2 --runtime-set ignore_warnings_on_exit 1 --extensions=php --ignore=${config.phpexclude} ` +
						`src/`
					// 'src/'
				],
				{ ignoreErrors: true }
			)
		)
		.on('end', cb);
};
exports.phpcbf = phpcbf;

// ============================rundist==================================//
const rundist = (cb) => {
	browserSync.init({
		// server: src,
		notify: false,
		browser: 'Chrome',
		proxy: `localhost/${localurl}/dist`
	});
	cb();
};
exports.rundist = rundist;
// ============================helper==================================//
const help = (cb) => {
	log('---------------------------------------------------------------------');
	log(`${pkg.name} ${pkg.version} ${config.environment} build`);
	log('---------------------------------------------------------------------');
	log(`${'browser serve url: localhost/'}${localurl}/src`);
	log('---------------------------------------------------------------------');
	log('                Usage: gulp [command]                                ');
	log('     The commands for the task runner are the following.             ');
	log('---------------------------------------------------------------------');
	log('                  gulp: Compile sass linter js, html                 ');
	log('          gulp prodrjs: buld for requrejs                            ');
	log('             gulp prod: buld all for no AMD                          ');
	log('            gulp prod2: buld for requrejs no compress img            ');
	log('             gulp sass: Compile the Sass styles                      ');
	log('            gulp clean: Removes all the compiled files on ./dist     ');
	log('          gulp rundist: run dystrybution version                     ');
	log('---------------------------------------------------------------------');
	cb();
};
exports.help = help;

// ========================watch + browserSync===============================//
const watchChange = (cb) => {
	// watch php
	const php = gulp.watch(
		config.phpin,
		{
			interval: 750
		},
		gulp.series(phpcbf, phpcode, reload)
	);
	php.on('change', (path) => {
		log(`File ${path}:  was changed running tasks...`);
	});
	php.on('add', (path) => {
		log(`File ${path}:  was added`);
	});
	php.on('unlink', (path) => {
		log(`File ${path}:  was removed`);
	});

	// watch react
	const react = gulp.watch(
		config.jsxin,
		{
			interval: 750
		},
		gulp.series(jsx2, reload)
	);
	react.on('change', (path) => {
		log(`File ${path} was changed running tasks...`);
	});
	react.on('add', (path) => {
		log(`File ${path} was added`);
	});
	react.on('unlink', (path) => {
		log(`File ${path} was removed`);
	});

	// watch js
	const js = gulp.watch(
		config.jsin,
		{
			interval: 750
		},
		gulp.series(jslint, reload)
	);
	js.on('change', (path) => {
		log(`File ${path} was changed running tasks...`);
	});
	js.on('add', (path) => {
		log(`File ${path} was added`);
	});
	js.on('unlink', (path) => {
		log(`File ${path} was removed`);
	});

	// watch sass
	const scss = gulp.watch(
		config.scssin,
		{
			interval: 750
		},
		gulp.series(sassCompile, reload)
	);
	scss.on('change', (path) => {
		log(`File ${path} was changed running tasks...`);
	});
	scss.on('add', (path) => {
		log(`File ${path} was added`);
	});
	scss.on('unlink', (path) => {
		log(`File ${path} was removed`);
	});

	// watch json
	const json = gulp.watch(
		config.jsonin,
		{
			interval: 750
		},
		gulp.series(jsonlinter, reload)
	);
	json.on('change', (path) => {
		log(`File ${path} was changed running tasks...`);
	});
	json.on('add', (path) => {
		log(`File ${path} was added`);
	});
	json.on('unlink', (path) => {
		log(`File ${path} was removed`);
	});

	// watch image
	const image = gulp.watch(
		config.imgin,
		{
			interval: 750
		},
		gulp.series(reload)
	);
	image.on('change', (path) => {
		log(`File ${path} was changed running tasks...`);
	});
	image.on('add', (path) => {
		log(`File ${path} was added`);
	});
	image.on('unlink', (path) => {
		log(`File ${path} was removed`);
	});

	cb();
};
exports.watchChange = watchChange;
// ============================copysrctodist==================================//

const copySrcToDist = (cb) => {
	let nSrc = 0;
	let nDes = 0;
	log('-> copy src');
	return gulp
		.src([`${src}**/*`, `!${src}**/*`, `${src}/js/`], { dot: true })
		.on('data', () => {
			nSrc += 1;
		})
		.pipe(
			plumber({
				errorHandler: onError
			})
		)
		.pipe(prettyError())
		.pipe(gulp.dest(dist))
		.on('data', () => {
			nDes += 1;
		})
		.on('finish', () => {
			log('Results for FILES');
			log('# src files: ', nSrc);
			log('# dest files:', nDes);
		})
		.on('end', cb);
};
exports.copySrcToDist = copySrcToDist;
// ============================callback==================================//
const callback = (cb) => {
	log('-> build dist');
	cb();
};
exports.callback = callback;
// ============================prod default==================================//
const dev = gulp.series(help, sassCompile, jsx2, serve, watchChange);
exports.default = dev;
// ============================dist no r.js==================================//
const prod = gulp.series(clean, html, buildJS, css, img, fonts, callback);
exports.prod = prod;
// ============================dist r.js + tinnypng==================================//
const prodrjs = gulp.series(
	clean,
	rjsbuild,
	cleanImage,
	img,
	revisionsCss,
	revreplace,
	cleanDistMapStyles,
	insertMninifyHtmlInPHP,
	cleanDistAfter,
	callback
);
exports.prodrjs = prodrjs;
// ============================dist r.js + no img compres==================================//
const prod2 = gulp.series(
	clean,
	rjsbuild,
	// cleanImage,
	// img,
	revisionsCss,
	revreplace,
	cleanDistMapStyles,
	insertMninifyHtmlInPHP,
	cleanDistAfter,
	callback
);
exports.prod2 = prod2;
