declare module 'qrcode-terminal' {
  interface Options {
    small?: boolean
  }
  function generate(input: string, opts?: Options, cb?: (qr: string) => void): void
  const qrcode: { generate: typeof generate }
  export = qrcode
}
