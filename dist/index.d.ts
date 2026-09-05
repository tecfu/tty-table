declare const styleEachChar: (value: string, ...styles: string[]) => string;

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

declare const style: (value: unknown, ...styles: string[]) => string;

declare const resetStyle: (value: string) => string;

declare class Table<T = unknown> extends Array<T> {
    readonly options: TableOptions;
    readonly header: unknown[];
    readonly footer: unknown[];
    height: number;
    constructor(header?: unknown[], rows?: T[], footer?: unknown[], options?: TableOptions);
    render(): string;
}
interface TableFactory {
    <T = unknown>(header: unknown[], rows: T[], footer?: unknown[] | TableOptions, options?: TableOptions): Table<T>;
    <T = unknown>(rows: T[], options?: TableOptions): Table<T>;
    style: typeof styleEachChar;
    resetStyle: typeof resetStyle;
    styleEachChar: typeof styleEachChar;
}
declare const factory: TableFactory;

export { type Alignment, type BorderCharacters, type BorderStyle, type CellValue, type ColumnOptions, type Formatter, type FormatterContext, type RenderConfig, type Scalar, Table, type TableFactory, type TableOptions, type Width, factory as default, resetStyle, style, styleEachChar };
