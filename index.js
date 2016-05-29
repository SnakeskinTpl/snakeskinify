/*!
 * snakeskin-loader
 * https://github.com/SnakeskinTpl/snakeskin-loader
 *
 * Released under the MIT license
 * https://github.com/SnakeskinTpl/snakeskin-loader/blob/master/LICENSE
 */

require('core-js/es6/object');

var
	$C = require('collection.js').$C;

var
	path = require('path'),
	through = require('through'),
	snakeskin = require('snakeskin'),
	beautify = require('js-beautify'),
	exists = require('exists-sync');

module.exports = function (file, opts) {
	if (!/\.ss/i.test(file)) {
		return through();
	}

	var
		ssrc = path.join(process.cwd(), '.snakeskinrc');

	if ($C(opts).every(function (el, key) { return key[0] === '_'; }) && exists(ssrc)) {
		Object.assign(opts, snakeskin.toObj(ssrc));
	}

	opts = Object.assign({
		module: 'cjs',
		eol: '\n',
		pack: true
	}, opts);

	var
		eol = opts.eol,
		prettyPrint = opts.prettyPrint,
		nRgxp = /\r?\n|\r/g;

	if (opts.exec && opts.prettyPrint) {
		opts.prettyPrint = false;
	}

	opts.debug = {};
	opts.cache = false;
	opts.throws = true;

	var source = '';
	return through(
		function (chunk) {
			source += chunk;
		},

		function () {
			var res;
			try {
				if (opts.jsx) {
					res = snakeskin.compileAsJSX(source, opts, {file: file});

				} else {
					var tpls = {};

					if (opts.exec) {
						opts.module = 'cjs';
						opts.context = tpls;
					}

					res = snakeskin.compile(source, opts, {file: file});

					if (opts.exec) {
						res = snakeskin.getMainTpl(tpls, file, opts.tpl) || '';

						if (res) {
							res = res(opts.data);

							if (prettyPrint) {
								res = beautify.html(res);
							}

							res = res.replace(nRgxp, eol) + eol;
						}
					}
				}

			} catch (err) {
				this.emit('error', err);
				return;
			}

			var that = this;
			$C(opts.debug.files).forEach(function (bool, filePath) {
				that.emit('file', filePath);
			});

			this.queue(res);
			this.queue(null);
		}
	);
};
