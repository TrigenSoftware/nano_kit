// The styles of the panel, all of them in one string: the library build puts them there, see `vite.config.js`
declare module 'virtual:styles' {
  const styles: string

  export default styles
}
