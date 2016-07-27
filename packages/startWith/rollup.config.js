import buble from 'rollup-plugin-buble'

export default {
  entry: 'lib/index.js',
  dest: 'dist/tempest-startWith.js',
  format: 'umd',
  moduleName: 'tempestStartWith',
  sourceMap: true,
  globals: {
    '@tempest/core': 'tempestCore'
  },
  plugins: [
    buble()
  ]
}