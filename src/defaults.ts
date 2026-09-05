import type { BorderCharacters, RenderConfig } from "./types"

export const borderCharacters: Record<string, BorderCharacters[]> = {
  invisible: [
    { v: " ", l: " ", j: " ", h: " ", r: " " }, { v: " ", l: " ", j: " ", h: " ", r: " " }, { v: " ", l: " ", j: " ", h: " ", r: " " }
  ],
  solid: [
    { v: "│", l: "┌", j: "┬", h: "─", r: "┐" }, { v: "│", l: "├", j: "┼", h: "─", r: "┤" }, { v: "│", l: "└", j: "┴", h: "─", r: "┘" }
  ],
  dashed: [
    { v: "|", l: "+", j: "+", h: "-", r: "+" }, { v: "|", l: "+", j: "+", h: "-", r: "+" }, { v: "|", l: "+", j: "+", h: "-", r: "+" }
  ],
  none: [
    { v: "", l: "", j: "", h: "", r: "" }, { v: "", l: "", j: "", h: "", r: "" }, { v: "", l: "", j: "", h: "", r: "" }
  ],
  "0": [], "1": [], "2": []
}
borderCharacters["0"] = borderCharacters.none!
borderCharacters["1"] = borderCharacters.solid!
borderCharacters["2"] = borderCharacters.dashed!

export const defaults: RenderConfig = {
  borderCharacters, align: "center", headerAlign: "center", footerAlign: "center", borderColor: false, borderStyle: "solid", color: false,
  headerColor: "yellow", footerColor: false, COLUMNS: 80, compact: false, defaultErrorValue: "�", defaultValue: "", errorOnNull: false,
  FIXED_WIDTH: false, marginLeft: 2, marginTop: 1, paddingBottom: 0, paddingLeft: 1, paddingRight: 1, paddingTop: 0, showHeader: null,
  truncate: false, width: "100%", GUTTER: 1, columnSettings: [], height: 0, tableId: 0
}
