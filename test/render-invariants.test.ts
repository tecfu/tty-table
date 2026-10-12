import { describe, expect, it } from "vitest"
import Table from "../src"
import { displayWidth, stripAnsi } from "../src/ansi"

const seedRandom = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) >>> 0
  return seed / 0x100000000
}

describe("render invariants", () => {
  it("keeps fixed-width rows within their declared geometry across varied input", () => {
    const random = seedRandom(0x51f15e)
    const alphabet = "abcXYZ0123 é界🙂"
    const pick = () => alphabet[Math.floor(random() * alphabet.length)]!
    const randomCell = () => Array.from({ length: 1 + Math.floor(random() * 30) }, pick).join("")

    for (let sample = 0; sample < 100; sample++) {
      const rows = Array.from({ length: 1 + Math.floor(random() * 4) }, () =>
        Array.from({ length: 1 + Math.floor(random() * 4) }, randomCell)
      )
      const output = Table(rows, { width: 40 }).render()
      for (const line of output.split(/\r?\n/).filter(Boolean)) {
        expect(displayWidth(stripAnsi(line))).toBeLessThanOrEqual(42)
      }
    }
  })
})
