declare module "breakword" {
  interface Breakword {
    (input: unknown, breakAtLength: number): number
    width(char: string): 0 | 1 | 2
  }

  const breakword: Breakword
  export default breakword
}
