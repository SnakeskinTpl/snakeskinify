/*!
 * snakeskinify
 * https://github.com/SnakeskinTpl/snakeskinify
 *
 * Released under the MIT license
 * https://github.com/SnakeskinTpl/snakeskinify/blob/master/LICENSE
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
		ssrc = path.join(process.cwd(), '.snakeskinrc'),
		info = {file: file};

	if (
		$C(opts).every(function (el, key) {
			return key[0] === '_';
		}) && exists(ssrc)

	) {
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
			var that = this;
			function cache() {
				$C(opts.debug.files).forEach(function (el, file) {
					that.emit('file', file);
				});
			}

			function cb(err, res) {
				if (err) {
					that.emit('error', err);

				} else {
					that.queue(res);
					that.queue(null);
				}
			}

			if (opts.adapter || opts.jsx) {
				return require(opts.jsx ? 'ss2react' : opts.adapter).adapter(source, opts, info).then(
					function (res) {
						cache();
						cb(null, res);
					},

					function (err) {
						cb(err);
					}
				);
			}

			try {
				var tpls = {};

				if (opts.exec) {
					opts.module = 'cjs';
					opts.context = tpls;
				}

				var res = snakeskin.compile(source, opts, info);
				cache();

				if (opts.exec) {
					res = snakeskin.getMainTpl(tpls, info.file, opts.tpl) || '';

					if (res) {
						return snakeskin.execTpl(res, opts.data).then(
							function (res) {
								if (prettyPrint) {
									res = beautify.html(res);
								}

								cb(null, res.replace(nRgxp, eol) + eol);
							},

							function (err) {
								cb(err);
							}
						);
					}
				}

				cb(null, res);

			} catch (err) {
				return cb(err);
			}
		}
	);
};
