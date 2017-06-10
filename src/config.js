let Config = {
  borderCharacters : [
    [
      {v: " ", l: " ", j: " ", h: " ", r: " "},
      {v: " ", l: " ", j: " ", h: " ", r: " "},
      {v: " ", l: " ", j: " ", h: " ", r: " "}
    ],
    [
      {v: "│", l: "┌", j: "┬", h: "─", r: "┐"},
      {v: "│", l: "├", j: "┼", h: "─", r: "┤"},
      {v: "│", l: "└", j: "┴", h: "─", r: "┘"}
    ],
    [
      {v: "|", l: "+", j: "+", h: "-", r: "+"},
      {v: "|", l: "+", j: "+", h: "-", r: "+"},
      {v: "|", l: "+", j: "+", h: "-", r: "+"}
    ]
  ],
  align : "center",
  borderColor : null,
  borderStyle : 1,
  color : false,
  compact : false,
  defaultErrorValue : "[32m[37m[41m ERROR!  [49m[32m[39m",
  defaultValue : "[32m[37m[41m ?  [49m[32m[39m",
  errorOnNull : false,
  footerAlign : "center",
  footerColor : false,
  formatter : null,
  headerAlign : "center",
  headerColor : "yellow",
  marginLeft : 2,
  marginTop : 1,
  paddingBottom : 0,
  paddingLeft : 0,
  paddingRight : 0,
  paddingTop : 0,
  tableType : null,
  truncate: false,
  width : 20,
};

Config.GUTTER = 1;
//save so cell options can be merged into column options
Config.columnSettings = [];
Config.headerEmpty = false;
Config.table = {
  body : '',
  columnInnerWidths : [],
  columnWidths : [],
  columns : [],
  footer : '',
  header : '', //post-rendered strings.
  height : 0,
  typeLocked : false //once a table type is selected can't switch
};

module.exports = Config;
