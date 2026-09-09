/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 项目实际使用的 scope 白名单（S2 提交规范）
    'scope-enum': [
      2,
      'always',
      ['eng', 'auth', 'product', 'cart', 'order', 'lib', 'ui', 'api', 'mock', 'docs'],
    ],
  },
}
