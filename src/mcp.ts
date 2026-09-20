#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { z } from "zod"
import Table from "./index"
import type { Header, Options } from "./index"
import pkg from "../package.json"

// pkg is bundled at build time by tsup, keeping serverInfo.version in sync
// with the package version without a runtime filesystem read

const headerEntry = z.union([
  z.string(),
  z.object({
    value: z.string(),
    align: z.enum(["left", "center", "right"]).optional(),
    width: z.union([z.number(), z.string()]).optional()
  })
])

/** Shared input schema for the render_table tool (used by server + tests). */
export const renderTableInputSchema = {
  header: z.array(headerEntry).optional()
    .describe("Column definitions: names, or {value, align, width} objects"),
  rows: z.array(z.union([z.array(z.unknown()), z.record(z.string(), z.unknown())]))
    .describe("Row data: arrays of cells, or objects keyed by column name"),
  options: z.record(z.string(), z.unknown()).optional()
    .describe("tty-table options, e.g. {width: 80, borderStyle: \"solid\"}")
}

export type RenderTableArgs = {
  header?: Array<z.infer<typeof headerEntry>> | undefined
  rows: Array<unknown[] | Record<string, unknown>>
  options?: Record<string, unknown> | undefined
}

/**
 * Core handler for the render_table MCP tool.
 * Extracted so unit tests can exercise success and error paths without
 * starting a stdio transport.
 */
export function handleRenderTable({ header, rows, options }: RenderTableArgs) {
  try {
    const opts = (options ?? {}) as Options
    // JSON input never carries explicit undefined, so the parsed shape
    // satisfies Header despite exactOptionalPropertyTypes
    const head = header as unknown as (string | Header)[] | undefined
    const table = head?.length ? Table(head, rows, opts) : Table(rows, opts)
    return { content: [{ type: "text" as const, text: table.render() }] }
  } catch (error) {
    return {
      isError: true as const,
      content: [{ type: "text" as const, text: error instanceof Error ? error.message : String(error) }]
    }
  }
}

/** Build a configured McpServer instance (does not connect a transport). */
export function createMcpServer() {
  const server = new McpServer({ name: "tty-table", version: pkg.version })

  server.registerTool(
    "render_table",
    {
      title: "Render a terminal table",
      description:
        "Render data as an ASCII/Unicode terminal table (tty-table). " +
        "Pass header (column names or {value, align, width} objects), rows (array of " +
        "arrays, or objects whose keys match the header), and optional options " +
        "(any tty-table table option, e.g. width, borderStyle, align, compact). " +
        "Returns the rendered table as text.",
      inputSchema: renderTableInputSchema
    },
    (args) => handleRenderTable(args)
  )

  return server
}

// Only start the stdio transport when this file is the process entry point
const isMain =
  typeof process !== "undefined" &&
  process.argv[1] &&
  (process.argv[1].endsWith("mcp.js") ||
    process.argv[1].endsWith("mcp.mjs") ||
    process.argv[1].endsWith("mcp.ts") ||
    process.argv[1].includes("tty-table-mcp"))

if (isMain) {
  const server = createMcpServer()
  void server.connect(new StdioServerTransport())
    .catch((error: unknown) => {
      process.stderr.write(error instanceof Error ? error.stack ?? error.message : String(error))
      process.exit(1)
    })
}
