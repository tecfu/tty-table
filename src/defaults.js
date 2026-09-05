// @TODO split defaults into table and cell settings
const defaults = {
  borderCharacters: {
    invisible: [
      { v: " ", l: " ", j: " ", h: " ", r: " " },
      { v: " ", l: " ", j: " ", h: " ", r: " " },
      { v: " ", l: " ", j: " ", h: " ", r: " " }
    ],
    solid: [
      { v: "│", l: "┌", j: "┬", h: "─", r: "┐" },
      { v: "│", l: "├", j: "┼", h: "─", r: "┤" },
      { v: "│", l: "└", j: "┴", h: "─", r: "┘" }
    ],
    dashed: [
      { v: "|", l: "+", j: "+", h: "-", r: "+" },
      { v: "|", l: "+", j: "+", h: "-", r: "+" },
      { v: "|", l: "+", j: "+", h: "-", r: "+" }
    ],
    none: [
      { v: "", l: "", j: "", h: "", r: "" },
      { v: "", l: "", j: "", h: "", r: "" },
      { v: "", l: "", j: "", h: "", r: "" }
    ]
  },
  align: "center",
  borderColor: null,
  borderStyle: "solid",
  color: false,
  COLUMNS: 80, // if !process.stdout.columns assume redirecting to write stream 80 columns is VT200 standard
  compact: false,
  defaultErrorValue: "�",
  defaultValue: "",
  errorOnNull: false,
  FIXED_WIDTH: false,
  footerAlign: "center",
  footerColor: false,
  formatter: null,
  headerAlign: "center",
  headerColor: "yellow",
  isNull: false, // undocumented cell setting
  marginLeft: 2,
  marginTop: 1,
  paddingBottom: 0,
  paddingLeft: 1,
  paddingRight: 1,
  paddingTop: 0,
  showHeader: null, // undocumented
  truncate: false,
  width: "100%",
  GUTTER: 1, // undocumented
  columnSettings: [],
  // save so cell options can be merged into column options
  table: {
    body: "",
    columnInnerWidths: [],
    columnWidths: [],
    columns: [],
    footer: "",
    header: "", // post-rendered strings.
    height: 0,
    typeLocked: false // once a table type is selected can't switch
  }
}

// support deprecated border style values
defaults.borderCharacters["0"] = defaults.borderCharacters.none
defaults.borderCharacters["1"] = defaults.borderCharacters.solid
defaults.borderCharacters["2"] = defaults.borderCharacters.dashed

module.exports = defaults
