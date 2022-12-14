module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
  plugins: [
    '@babel/plugin-transform-runtime',
    '@babel/proposal-class-properties',
    '@babel/transform-regenerator',
    '@babel/plugin-transform-template-literals',
    'react-hot-loader/babel',
  ],
}
