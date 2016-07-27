import buble from 'rollup-plugin-buble'

export default {
  entry: 'lib/index.js',
  dest: 'dist/tempest-flatten.js',
  format: 'umd',
  moduleName: 'tempestFlatten',
  sourceMap: true,
  globals: {
    '@tempest/core': 'tempestCore'
  },
  plugins: [
    buble()
  ]
}