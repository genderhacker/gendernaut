import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'

export default {
	input: 'public/js/src/gendernaut-public.js',
	external: ['jquery'],
	output: {
		file: 'public/js/gendernaut-public.js',
		format: 'iife',
		globals: {
			jquery: 'jQuery'
		}
	},
	plugins: [
		resolve(),
		babel({
			presets: [
				[
					"@babel/env", {
						"modules": false,
						"targets": "last 3 version, > 0.25%, not dead"
					}
				]
			],
			babelrc: false,
			exclude: 'node_modules/**' // only transpile our source code
		})
	]
}
