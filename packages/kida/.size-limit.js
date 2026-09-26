function modifyRolldownConfig(config) {
  return {
    ...config,
    transform: {
      define: {
        'import.meta.env.DEV': 'false'
      }
    }
  }
}

export default [
  {
    name: 'All publics (Gzip)',
    gzip: true,
    path: 'dist/index.production.js',
    import: '*',
    limit: '5.2 kB',
    modifyRolldownConfig
  },
  {
    name: 'All publics (Brotli)',
    path: 'dist/index.production.js',
    import: '*',
    limit: '4.85 kB',
    modifyRolldownConfig
  },
  {
    name: 'Signal (Gzip)',
    gzip: true,
    path: 'dist/index.production.js',
    import: '{ signal }',
    limit: '1.4 kB',
    modifyRolldownConfig
  },
  {
    name: 'Signal (Brotli)',
    path: 'dist/index.production.js',
    import: '{ signal }',
    limit: '1.35 kB',
    modifyRolldownConfig
  },
  {
    name: 'Popular set (Gzip)',
    gzip: true,
    path: 'dist/index.production.js',
    import: '{ signal, record, computed, effect, mountable, onMount }',
    limit: '2.35 kB',
    modifyRolldownConfig
  },
  {
    name: 'Popular set (Brotli)',
    path: 'dist/index.production.js',
    import: '{ signal, record, computed, effect, mountable, onMount }',
    limit: '2.2 kB',
    modifyRolldownConfig
  }
]
