#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { z } from "zod"
import Table from "./index"
import type { Header, Options } from "./index"

const headerEntry = z.union([
  z.string(),
  z.object({
    value: z.string(),
    align: z.enum(["left", "center", "right"]).optional(),
    width: z.union([z.number(), z.string()]).optional()
  })
])

const server = new McpServer({ name: "tty-table", version: "1.0.0" })

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
    inputSchema: {
      header: z.array(headerEntry).optional()
        .describe("Column definitions: names, or {value, align, width} objects"),
      rows: z.array(z.union([z.array(z.unknown()), z.record(z.string(), z.unknown())]))
        .describe("Row data: arrays of cells, or objects keyed by column name"),
      options: z.record(z.string(), z.unknown()).optional()
        .describe("tty-table options, e.g. {width: 80, borderStyle: \"solid\"}")
    }
  },
  ({ header, rows, options }) => {
    try {
      const opts = (options ?? {}) as Options
      // JSON input never carries explicit undefined, so the parsed shape
      // satisfies Header despite exactOptionalPropertyTypes
      const head = header as unknown as (string | Header)[]
      const table = head?.length ? Table(head, rows, opts) : Table(rows, opts)
      return { content: [{ type: "text" as const, text: table.render() }] }
    } catch (error) {
      return {
        isError: true,
        content: [{ type: "text" as const, text: error instanceof Error ? error.message : String(error) }]
      }
    }
  }
)

void server.connect(new StdioServerTransport())
  .catch((error: unknown) => {
    process.stderr.write(error instanceof Error ? error.stack ?? error.message : String(error))
    process.exit(1)
  })
