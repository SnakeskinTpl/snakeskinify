'use strict';

/*!
 * snakeskinify
 * https://github.com/SnakeskinTpl/snakeskinify
 *
 * Released under the MIT license
 * https://github.com/SnakeskinTpl/snakeskinify/blob/master/LICENSE
 */

const
	$C = require('collection.js/compiled');

const
	path = require('path'),
	through = require('through'),
	snakeskin = require('snakeskin'),
	beautify = require('js-beautify'),
	exists = require('exists-sync');

module.exports = function (file, opts) {
	if (!/\.ss/i.test(file)) {
		return through();
	}

	const
		ssrc = path.join(process.cwd(), '.snakeskinrc'),
		info = {file};

	if (
		$C(opts).every((el, key) => key[0] === '_') && exists(ssrc)

	) {
		Object.assign(opts, snakeskin.toObj(ssrc));
	}

	opts = Object.assign({
		module: 'cjs',
		eol: '\n',
		pack: true
	}, opts);

	const
		eol = opts.eol,
		prettyPrint = opts.prettyPrint,
		nRgxp = /\r?\n|\r/g;

	if (opts.exec && opts.prettyPrint) {
		opts.prettyPrint = false;
	}

	opts.debug = {};
	opts.cache = false;
	opts.throws = true;

	let source = '';
	return through(
		(chunk) => {
			source += chunk;
		},

		function () {
			function cache() {
				$C(opts.debug.files).forEach((el, file) => this.emit('file', file));
			}

			const cb = (err, res) => {
				if (err) {
					this.emit('error', err);

				} else {
					this.queue(res);
					this.queue(null);
				}
			};

			if (opts.adapter || opts.jsx) {
				return require(opts.jsx ? 'ss2react' : opts.adapter).adapter(source, opts, info).then(
					(res) => {
						cache();
						cb(null, res);
					},

					(err) => {
						cb(err);
					}
				);
			}

			try {
				const
					tpls = {};

				if (opts.exec) {
					opts.module = 'cjs';
					opts.context = tpls;
				}

				let res = snakeskin.compile(source, opts, info);
				cache();

				if (opts.exec) {
					res = snakeskin.getMainTpl(tpls, info.file, opts.tpl) || '';

					if (res) {
						return snakeskin.execTpl(res, opts.data).then(
							(res) => {
								if (prettyPrint) {
									res = beautify.html(res);
								}

								cb(null, res.replace(nRgxp, eol) + eol);
							},

							(err) => {
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
