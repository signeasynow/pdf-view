/* tslint:disable */
/* eslint-disable */
/**
*/
export function start(): void;
/**
* @param {Uint8Array} pdf_data
* @param {Uint32Array} pages_to_delete
* @returns {Uint8Array}
*/
export function remove_pages(pdf_data: Uint8Array, pages_to_delete: Uint32Array): Uint8Array;
/**
* @param {Uint8Array} pdf_data
* @param {number} from_index
* @param {number} to_index
* @returns {Uint8Array}
*/
export function move_page(pdf_data: Uint8Array, from_index: number, to_index: number): Uint8Array;
/**
* @param {Uint8Array} pdf_data
* @param {Uint32Array} pages_to_rotate
* @param {boolean} clockwise
* @returns {Uint8Array}
*/
export function rotate_pages(pdf_data: Uint8Array, pages_to_rotate: Uint32Array, clockwise: boolean): Uint8Array;
/**
* @param {Uint8Array} pdf_data
* @returns {Uint8Array}
*/
export function add_watermark(pdf_data: Uint8Array): Uint8Array;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly remove_pages: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly move_page: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly rotate_pages: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly add_watermark: (a: number, b: number, c: number) => void;
  readonly start: () => void;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
