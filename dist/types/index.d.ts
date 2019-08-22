import { NovelData, InitArgs } from "./interfaces";
export * from "./interfaces";
export declare const run: (ncode: string, initArgs?: InitArgs | undefined) => Promise<NovelData>;
