require('esbuild')
	.build({
		entryPoints: ['./src/index.ts'],
		outdir: './build/cdn',
		format: 'iife',
		bundle: true,
		minify: true,
		sourcemap: 'external',
		keepNames: false,
		external: ['isomorphic-unfetch'],
		target: ['es2019']
	})
	.catch(() => process.exit(1))
