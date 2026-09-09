/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-axios-in-ui',
      comment: 'UI 层（pages/components/common）不得直接依赖 axios，必须经 api/hooks 封装（S1 架构边界）',
      severity: 'error',
      from: { path: 'src/(features/.+/(pages|components)|common)/.*\\.(ts|tsx)$' },
      to: { dependencyTypes: ['npm'], path: 'node_modules/axios' },
    },
    {
      name: 'no-reverse-dep',
      comment: 'lib/api 层不得反向依赖业务 features 层（S1 架构边界）',
      severity: 'error',
      from: { path: 'src/(lib|api)/' },
      to: { path: 'src/features/' },
    },
    {
      name: 'no-common-to-features',
      comment: 'common 是被依赖方，不得依赖 features（S1 架构边界）',
      severity: 'error',
      from: { path: 'src/common/' },
      to: { path: 'src/features/' },
    },
    {
      name: 'no-cross-feature',
      comment: 'feature 之间禁止横向依赖（S1 架构边界）。注意：from 的捕获组在 to 中用 $1 引用（cruiser 语法，非 JS 的 \\1）',
      severity: 'error',
      from: { path: 'src/features/([^/]+)/' },
      to: { path: 'src/features/(?!$1/)[^/]+' },
    },
  ],
}
