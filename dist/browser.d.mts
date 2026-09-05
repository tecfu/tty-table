declare function TtyTable(headers: (string | TtyTable.Header | TtyTable.Formatter)[], body: string[][] | object[], footers: (string | TtyTable.Header | TtyTable.Formatter)[], config?: TtyTable.Options): TtyTable.Table;
declare function TtyTable(header: (string | TtyTable.Header | TtyTable.Formatter)[], body: unknown[], config?: TtyTable.Options): TtyTable.Table;
declare function TtyTable(body: unknown[], config?: TtyTable.Options): TtyTable.Table;

declare namespace TtyTable {

  interface Formatter {
    (cellValue: any, columnIndex: number, rowIndex: number, rowData: any, inputData: any): string;
  }

  export interface Header {
    alias?: string;
    align?: string;
    color?: string;
    footerAlign?: string;
    footerColor?: string;
    formatter?: Formatter;
    headerAlign?: string;
    headerColor?: string;
    marginLeft?: number;
    marginTop?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    paddingRight?: number;
    paddingTop?: number;
    value: string;
    width?: string | number;
  }

  export interface Options {
    borderStyle?: string;
    borderColor?: string;
    color?: string;
    compact?: boolean;
    defaultErrorValue?: string;
    defaultValue?: string;
    errorOnNull?: boolean;
    truncate?: string | boolean;
    width?: string | number;
    footerColor?: string;
  }

  export interface Config extends Options {
    borderCharacters: object;
    showHeader: boolean;
    tableId: string;
    table: TableState;
  }

  export interface Table extends Array<string | object> {
    render(): string;
  }

  class TableState {
    body: string;
    columnInnerWidths: number[];
    columnWidths: number[];
    columns: number[];
    footer: string;
    header: string;
    height: number;
  }
}

type Scalar = string | number | boolean | bigint | null | undefined;
type CellValue = Scalar | object;
type Alignment = "left" | "center" | "right";
type BorderStyle = "solid" | "dashed" | "none" | "invisible" | 0 | 1 | 2;
type Width = "auto" | "100%" | `${number}%` | `${number}` | number;
interface BorderCharacters {
    v: string;
    l: string;
    j: string;
    h: string;
    r: string;
}
interface ColumnOptions {
    value?: string;
    alias?: string;
    width?: Width;
    align?: Alignment;
    alignment?: Alignment;
    headerAlign?: Alignment;
    headerAlignment?: Alignment;
    color?: string | false;
    headerColor?: string | false;
    footerColor?: string | false;
    formatter?: Formatter;
    paddingLeft?: number;
    paddingRight?: number;
    paddingTop?: number;
    paddingBottom?: number;
    truncate?: false | true | string;
    defaultValue?: string;
    defaultErrorValue?: string;
    errorOnNull?: boolean;
    reset?: boolean;
}
interface TableOptions extends ColumnOptions {
    borderCharacters?: Record<string, BorderCharacters[]>;
    borderColor?: string | false;
    borderStyle?: BorderStyle;
    COLUMNS?: number;
    compact?: boolean;
    FIXED_WIDTH?: boolean;
    GUTTER?: number;
    marginLeft?: number;
    marginTop?: number;
    showHeader?: boolean | null;
    footerAlign?: Alignment;
    table?: Record<string, unknown>;
    terminalAdapter?: boolean;
    columnSettings?: ColumnOptions[];
}
interface FormatterContext {
    value: unknown;
    columnIndex: number;
    rowIndex: number | null;
    row: unknown[];
    input: unknown[];
    configure(options: Partial<ColumnOptions>): void;
    style(value: string, ...styles: string[]): string;
    resetStyle(value: string): string;
}
type Formatter = ((value: unknown, columnIndex: number, rowIndex: number | null, row: unknown[], input: unknown[]) => unknown) & {
    modern?: (context: FormatterContext) => unknown;
};
interface RenderConfig extends Required<Pick<TableOptions, "align" | "borderStyle" | "compact" | "COLUMNS" | "marginLeft" | "marginTop" | "paddingLeft" | "paddingRight" | "paddingTop" | "paddingBottom" | "GUTTER" | "width" | "defaultValue" | "defaultErrorValue" | "errorOnNull">> {
    headerAlign: Alignment;
    footerAlign: Alignment;
    color: string | false;
    headerColor: string | false;
    footerColor: string | false;
    borderColor: string | false;
    truncate: false | string;
    showHeader: boolean | null;
    FIXED_WIDTH: boolean;
    borderCharacters: Record<string, BorderCharacters[]>;
    columnSettings: ColumnOptions[];
    height: number;
    tableId: number;
}

export { type Alignment, type BorderCharacters, type BorderStyle, type CellValue, type ColumnOptions, type Formatter, type FormatterContext, type RenderConfig, type Scalar, type TableOptions, type Width, TtyTable as default };
