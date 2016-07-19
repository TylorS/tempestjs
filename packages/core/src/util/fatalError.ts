export function fatalError (err: Error): void {
  setTimeout(() => { throw err }, 0)
}