#!/usr/bin/env node
import fs from "node:fs"
import path from "node:path"
import { parse } from "csv"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import Table from "./index"
import { style } from "./style"

const main = async (): Promise<void> => {
  const argv = await yargs(hideBin(process.argv)).options({
    config: { type: "string" },
    format: { choices: ["json", "csv"] as const, default: "csv" },
    "csv-delimiter": { type: "string", default: "," },
    "csv-escape": { type: "string" },
    "csv-rowDelimiter": { type: "string", default: "\n" }
  }).parse()

  const options: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(argv)) if (key.startsWith("options-")) options[key.slice(8)] = value

  let header: unknown[] = []
  if (argv.config) {
    const parsedHeader: unknown = JSON.parse(fs.readFileSync(path.resolve(argv.config), "utf8"))
    if (!Array.isArray(parsedHeader)) fail("Configuration error", "The header configuration must be a JSON array.")
    header = parsedHeader
  }

  const stdin = await new Promise<string>((resolve) => {
    let data = ""
    process.stdin.setEncoding("utf8")
    process.stdin.on("data", (chunk: string) => { data += chunk })
    process.stdin.on("end", () => resolve(data))
  })

  function fail(title: string, detail: string): never {
    console.error(`\n${style(title, "white", "bgRed")}\n\n${detail}`)
    process.exit(1)
  }

  let rows: unknown[]
  if (argv.format === "json") {
    try {
      const parsed: unknown = JSON.parse(stdin)
      rows = Array.isArray(parsed) ? parsed : fail("JSON parse error", "Please provide a JSON array or use --format csv.")
    } catch {
      fail("JSON parse error", "Please provide valid JSON or use --format csv.")
    }
  } else {
    try {
      rows = await new Promise<unknown[]>((resolve, reject) => {
        const csvOptions: Parameters<typeof parse>[1] = {
          delimiter: argv["csv-delimiter"],
          record_delimiter: argv["csv-rowDelimiter"]
        }
        const escape = argv["csv-escape"]
        if (escape !== undefined) csvOptions.escape = escape

        parse(stdin, csvOptions, (error, records) => {
          if (error) reject(error)
          else resolve(records as unknown[])
        })
      })
    } catch {
      fail("CSV parse error", "Please provide valid comma-separated values or use --format json.")
    }
  }

  const table = Table(header, rows, options)
  process.stdout.write(table.render() + "\n")
}

void main()
