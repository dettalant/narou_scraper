import { NovelData } from "./interfaces";
export * from "./interfaces";
export declare const run: (ncode: string, beginEp: number, endEp?: number | undefined) => Promise<NovelData>;
