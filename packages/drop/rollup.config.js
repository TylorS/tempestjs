import buble from 'rollup-plugin-buble'

export default {
  entry: 'lib/index.js',
  dest: 'dist/tempest-drop.js',
  format: 'umd',
  moduleName: 'tempestDrop',
  sourceMap: true,
  globals: {
    '@tempest/core': 'tempestCore'
  },
  plugins: [
    buble()
  ]
}