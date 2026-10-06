import Table from "../src"
import type { Options, Header } from "../src/factory"

// The value of this file is checked by `npm run typecheck`, not by the runtime
// assertions below: on master several of these constructs do not compile even
// though the library handles them, and the @ts-expect-error directives would be
// reported as unused where the types are correct.

describe("public option types", () => {
  it("accepts every documented borderStyle, including the numeric aliases", () => {
    const styles = ["solid", "dashed", "none", "invisible", 0, 1, 2] as const
    for (const borderStyle of styles) {
      const out = Table(["a"], [[1]], { borderStyle }).render()
      expect(out).toContain("1")
    }
  })

  it("accepts a header column named by alias alone", () => {
    const header: Header[] = [{ alias: "named" }]
    const out = Table(header, [["v"]]).render()
    expect(out).toContain("named")
    expect(out).toContain("v")
  })

  it("accepts the table-level options the renderer reads", () => {
    const options: Options = {
      align: "center",
      borderColor: false,
      borderStyle: "solid",
      color: false,
      compact: false,
      COLUMNS: 80,
      defaultErrorValue: "?",
      defaultValue: "",
      errorOnNull: false,
      FIXED_WIDTH: false,
      footerAlign: "left",
      footerColor: false,
      GUTTER: 1,
      headerAlign: "right",
      headerColor: false,
      marginLeft: 2,
      marginTop: 1,
      paddingBottom: 0,
      paddingLeft: 1,
      paddingRight: 1,
      paddingTop: 0,
      showHeader: null,
      terminalAdapter: false,
      truncate: false,
      width: "100%"
    }
    expect(Table(["a"], [[1]], options).render()).toContain("1")
  })

  it("still lets a string-valued option through", () => {
    // built at runtime from a config file or a CLI flag: not a literal
    const fromConfig: Record<string, unknown> = { borderStyle: "solid", align: "center" }
    const options: Options = { ...fromConfig, marginLeft: 2 }
    expect(Table(["a"], [[1]], options).render()).toContain("1")
  })

  it("rejects option values the renderer cannot use", () => {
    // @ts-expect-error a margin is a number of cells, not a word
    const bad: Options = { marginLeft: "wide" }
    // @ts-expect-error showHeader is a boolean (or null to infer it)
    const worse: Options = { showHeader: "yes" }
    expect([bad, worse]).toHaveLength(2)
  })

  it("keeps string-valued options open, on purpose", () => {
    // align and borderStyle accept any string so a value read from a config file
    // or a CLI flag still compiles; an unknown one is a runtime problem, as it
    // always was. This is the one place the type is deliberately loose.
    const runtimeValue: string = "center"
    const options: Options = { align: runtimeValue, borderStyle: "solid" }
    expect(Table(["a"], [[1]], options).render()).toContain("1")
  })
})
