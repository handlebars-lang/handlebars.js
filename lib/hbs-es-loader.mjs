/**
 * This is an experimental automatic precompiler for
 * ECMAScript Modules in Node.js (aka the Michael Jackson Solution)
 * 
 * 
 * usage:
 * 
 * node --experimental-loader handlebars/lib/hbs-es-loader.mjs index.js
 * 
 * or
 * 
 * export NODE_OPTIONS="--experimental-loader handlebars/lib/hbs-es-loader.mjs"
 * node index.js
 * 
 * 
 * then import the template and use it as a function:
 * 
 * import tmpl from '../handlebars/email-alert.handlebars';
 * const text = tmpl({});
 */

import * as path from 'path';
import handlebars from 'handlebars';

/**
 * @param {string} url
 * @param {Object} context (currently empty)
 * @param {Function} defaultGetFormat
 * @returns {Promise<{ format: string }>}
 */
export async function getFormat(url, context, defaultGetFormat) {
	try {
		const ext = path.extname(url);
		if (ext === '.hbs' || ext === '.handlebars') {
			return {
				format: 'module'
			};
		}
	} catch (e) {
		console.log(e);
	}
	// Defer to Node.js for all other URLs.
	return defaultGetFormat(url, context, defaultGetFormat);
}


/**
 * @param {!(string | SharedArrayBuffer | Uint8Array)} source
 * @param {{
 *   format: string,
 *   url: string,
 * }} context
 * @param {Function} defaultTransformSource
 * @returns {Promise<{ source: !(string | SharedArrayBuffer | Uint8Array) }>}
 */
const _header = 'import handlebars from "handlebars"; const _template = handlebars.template(';
const _footer = '); export default _template;'
export async function transformSource(source, context, defaultTransformSource) {
	const { url, format } = context;
	try {
		const ext = path.extname(url);
		if (format === 'module' && (ext === '.hbs' || ext === '.handlebars')) {
			return {
				source: _header + handlebars.precompile(source.toString()) + _footer
			}
		}
	} catch (e) {
		console.log(e);
	}
	// Defer to Node.js for all other sources.
	return defaultTransformSource(source, context, defaultTransformSource);
}