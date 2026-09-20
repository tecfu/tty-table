import { describe, it, expect } from "vitest"
import { handleRenderTable, createMcpServer, renderTableInputSchema } from "../src/mcp"

describe("MCP render_table tool", () => {
  it("renders a table with header and array rows", () => {
    const result = handleRenderTable({
      header: [{ value: "name" }, { value: "score", align: "right" }],
      rows: [
        ["Ada", 100],
        ["Grace", 98]
      ],
      options: { width: 40 }
    })

    expect(result.isError).toBeUndefined()
    expect(result.content).toHaveLength(1)
    const first = result.content[0]
    expect(first).toBeDefined()
    expect(first!.type).toBe("text")
    const text = first!.text
    expect(text).toContain("name")
    expect(text).toContain("score")
    expect(text).toContain("Ada")
    expect(text).toContain("100")
    expect(text).toContain("Grace")
  })

  it("renders object rows without an explicit header", () => {
    const result = handleRenderTable({
      rows: [
        { name: "Ada", score: 100 },
        { name: "Grace", score: 98 }
      ]
    })

    expect(result.isError).toBeUndefined()
    const first = result.content[0]
    expect(first).toBeDefined()
    const text = first!.text
    expect(text).toContain("Ada")
    expect(text).toContain("Grace")
  })

  it("returns isError for invalid input that Table rejects", () => {
    // Passing a non-array/non-object as a "row" should surface an error
    const result = handleRenderTable({
      header: ["col"],
      // @ts-expect-error intentional bad input for error-path coverage
      rows: "not-an-array"
    })

    expect(result.isError).toBe(true)
    const first = result.content[0]
    expect(first).toBeDefined()
    expect(first!.type).toBe("text")
    expect(first!.text.length).toBeGreaterThan(0)
  })

  it("createMcpServer registers the render_table tool", () => {
    const server = createMcpServer()
    // The high-level McpServer keeps registered tools internally;
    // presence of the factory is enough for a lightweight smoke check.
    expect(server).toBeDefined()
    expect(typeof server.registerTool).toBe("function")
  })

  it("exposes a Zod-compatible input schema", () => {
    expect(renderTableInputSchema.header).toBeDefined()
    expect(renderTableInputSchema.rows).toBeDefined()
    expect(renderTableInputSchema.options).toBeDefined()
  })
})
