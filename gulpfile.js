// gulpfile.js
const gulp           = require('gulp'),
			sass           = require('gulp-sass'),
			cleancss       = require('gulp-clean-css'),
			rename         = require('gulp-rename'),
			autoprefixer   = require('gulp-autoprefixer'),
			notify         = require("gulp-notify"),
			concat         = require('gulp-concat'),
			uglify         = require('gulp-uglify'),

			imagemin       = require('gulp-imagemin'),
			cache          = require('gulp-cache'),

			nunjucksRender = require('gulp-nunjucks-render'),

			browserSync    = require('browser-sync').create();

const PATHS = {
			output:    'dist',
			templates: 'app',
			pages:     'app/pages',
			sass:      'app/sass/**/*.sass',
			comjs:     'app/js/common.js',
			libs:      'app/libs',
	}

gulp.task('browserSync', function() {
	browserSync.init({
		server: {
			baseDir: PATHS.output
		},
		notify: false,
		// open: false,
	});
});

gulp.task('styles', function() {
	return gulp.src(PATHS.sass)
	.pipe(sass({ outputStyle: 'expand' }).on("error", notify.onError()))
	.pipe(rename({ suffix: '.min', prefix : '' }))
	.pipe(autoprefixer(['last 15 versions']))
	.pipe(cleancss( {level: { 1: { specialComments: 0 } } })) // Opt., comment out when debugging
	.pipe(gulp.dest(PATHS.output + '/css'))
	.pipe(browserSync.stream())
});

gulp.task('js', function() {
	return gulp.src([ 
		PATHS.libs + '/jquery/dist/jquery.min.js',
		PATHS.comjs,])
	.pipe(concat('scripts.min.js'))
	// .pipe(uglify()) // Mifify js (opt.)
	.pipe(gulp.dest(PATHS.output + '/js'))
	.pipe(browserSync.reload({ stream: true }))
});

// writing up the gulp nunjucks task
gulp.task('nunjucks', function() {
	console.log('Rendering nunjucks files..');
	return gulp.src(PATHS.pages + '/**/*.html')
	.pipe(nunjucksRender({
		path: [PATHS.templates],
		watch: true,
	}).on("error", notify.onError()))
	.pipe(gulp.dest(PATHS.output));
});


gulp.task('watch', function() {
	gulp.watch(PATHS.sass, ['styles']);
	gulp.watch(PATHS.comjs, ['js']);

	gulp.watch(PATHS.templates + '/**/*.html', ['nunjucks'])
	gulp.watch(PATHS.output + '/*.html', browserSync.reload);
});

gulp.task('image', function() {
	return gulp.src('app/img/**/*')
	.pipe(cache(imagemin({prigressive: true})))
	.pipe(gulp.dest(PATHS.output + '/img'));
});

gulp.task('build', ['nunjucks', 'styles', 'js', 'image'], function() {
	return gulp.src(['app/fonts/**/*'])
	.pipe(gulp.dest(PATHS.output + '/fonts'));
});

gulp.task('default', ['browserSync', 'watch']);




gulp.task('deploy', function() {
	return gulp.src(PATHS.output + '/**')
	.pipe(rsync({
		root: PATHS.output,
		hostname: 'username@yousite.com',
		destination: 'yousite/public_html/',
		// include: ['*.htaccess'], // Includes files to deploy
		exclude: ['**/Thumbs.db', '**/*.DS_Store'], // Excludes files from deploy
		recursive: true,
		archive: true,
		silent: false,
		compress: true
	}))
});