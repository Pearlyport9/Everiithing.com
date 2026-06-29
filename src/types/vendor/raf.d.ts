declare module 'raf' {
  const raf: (cb: () => void) => number
  export default raf
}
