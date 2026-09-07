function modifyEsbuildConfig(config) {
  return {
    ...config,
    define: {
      'import.meta.env.DEV': 'false'
    }
  }
}

export default [
  {
    name: 'All publics (Gzip)',
    gzip: true,
    path: 'dist/index.production.js',
    import: '*',
    limit: '5.05 kB',
    modifyEsbuildConfig
  },
  {
    name: 'All publics (Brotli)',
    path: 'dist/index.production.js',
    import: '*',
    limit: '4.65 kB',
    modifyEsbuildConfig
  },
  {
    name: 'Signal (Gzip)',
    gzip: true,
    path: 'dist/index.production.js',
    import: '{ signal }',
    limit: '1.45 kB',
    modifyEsbuildConfig
  },
  {
    name: 'Signal (Brotli)',
    path: 'dist/index.production.js',
    import: '{ signal }',
    limit: '1.35 kB',
    modifyEsbuildConfig
  },
  {
    name: 'Popular set (Gzip)',
    gzip: true,
    path: 'dist/index.production.js',
    import: '{ signal, record, computed, effect, mountable, onMount }',
    limit: '2.4 kB',
    modifyEsbuildConfig
  },
  {
    name: 'Popular set (Brotli)',
    path: 'dist/index.production.js',
    import: '{ signal, record, computed, effect, mountable, onMount }',
    limit: '2.25 kB',
    modifyEsbuildConfig
  }
]
