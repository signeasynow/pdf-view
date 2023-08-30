let wasm;const cachedTextDecoder="undefined"!=typeof TextDecoder?new TextDecoder("utf-8",{ignoreBOM:!0,fatal:!0}):{decode:()=>{throw Error("TextDecoder not available")}};"undefined"!=typeof TextDecoder&&cachedTextDecoder.decode();let cachedUint8Memory0=null;function getUint8Memory0(){return null!==cachedUint8Memory0&&0!==cachedUint8Memory0.byteLength||(cachedUint8Memory0=new Uint8Array(wasm.memory.buffer)),cachedUint8Memory0}function getStringFromWasm0(e,t){return e>>>=0,cachedTextDecoder.decode(getUint8Memory0().subarray(e,e+t))}const heap=new Array(128).fill(void 0);heap.push(void 0,null,!0,!1);let heap_next=heap.length;function addHeapObject(e){heap_next===heap.length&&heap.push(heap.length+1);const t=heap_next;return heap_next=heap[t],heap[t]=e,t}let WASM_VECTOR_LEN=0;function passArray8ToWasm0(e,t){const n=t(1*e.length,1)>>>0;return getUint8Memory0().set(e,n/1),WASM_VECTOR_LEN=e.length,n}let cachedUint32Memory0=null;function getUint32Memory0(){return null!==cachedUint32Memory0&&0!==cachedUint32Memory0.byteLength||(cachedUint32Memory0=new Uint32Array(wasm.memory.buffer)),cachedUint32Memory0}function passArray32ToWasm0(e,t){const n=t(4*e.length,4)>>>0;return getUint32Memory0().set(e,n/4),WASM_VECTOR_LEN=e.length,n}let cachedInt32Memory0=null;function getInt32Memory0(){return null!==cachedInt32Memory0&&0!==cachedInt32Memory0.byteLength||(cachedInt32Memory0=new Int32Array(wasm.memory.buffer)),cachedInt32Memory0}function getObject(e){return heap[e]}function dropObject(e){e<132||(heap[e]=heap_next,heap_next=e)}function takeObject(e){const t=getObject(e);return dropObject(e),t}function getArrayU8FromWasm0(e,t){return e>>>=0,getUint8Memory0().subarray(e/1,e/1+t)}export function remove_pages(e,t){try{const i=wasm.__wbindgen_add_to_stack_pointer(-16),c=passArray8ToWasm0(e,wasm.__wbindgen_malloc),s=WASM_VECTOR_LEN,_=passArray32ToWasm0(t,wasm.__wbindgen_malloc),m=WASM_VECTOR_LEN;wasm.remove_pages(i,c,s,_,m);var n=getInt32Memory0()[i/4+0],r=getInt32Memory0()[i/4+1],a=getInt32Memory0()[i/4+2];if(getInt32Memory0()[i/4+3])throw takeObject(a);var o=getArrayU8FromWasm0(n,r).slice();return wasm.__wbindgen_free(n,1*r),o}finally{wasm.__wbindgen_add_to_stack_pointer(16)}}export function greet(){let e,t;try{const a=wasm.__wbindgen_add_to_stack_pointer(-16);wasm.greet(a);var n=getInt32Memory0()[a/4+0],r=getInt32Memory0()[a/4+1];return e=n,t=r,getStringFromWasm0(n,r)}finally{wasm.__wbindgen_add_to_stack_pointer(16),wasm.__wbindgen_free(e,t,1)}}async function __wbg_load(e,t){if("function"==typeof Response&&e instanceof Response){if("function"==typeof WebAssembly.instantiateStreaming)try{return await WebAssembly.instantiateStreaming(e,t)}catch(t){if("application/wasm"==e.headers.get("Content-Type"))throw t;console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n",t)}const n=await e.arrayBuffer();return await WebAssembly.instantiate(n,t)}{const n=await WebAssembly.instantiate(e,t);return n instanceof WebAssembly.Instance?{instance:n,module:e}:n}}function __wbg_get_imports(){const e={wbg:{}};return e.wbg.__wbindgen_string_new=function(e,t){return addHeapObject(getStringFromWasm0(e,t))},e}function __wbg_init_memory(e,t){}function __wbg_finalize_init(e,t){return wasm=e.exports,__wbg_init.__wbindgen_wasm_module=t,cachedInt32Memory0=null,cachedUint32Memory0=null,cachedUint8Memory0=null,wasm}function initSync(e){if(void 0!==wasm)return wasm;const t=__wbg_get_imports();return __wbg_init_memory(t),e instanceof WebAssembly.Module||(e=new WebAssembly.Module(e)),__wbg_finalize_init(new WebAssembly.Instance(e,t),e)}async function __wbg_init(e){if(void 0!==wasm)return wasm;void 0===e&&(e=new URL("pdf_wasm_project_bg.wasm",import.meta.url));const t=__wbg_get_imports();("string"==typeof e||"function"==typeof Request&&e instanceof Request||"function"==typeof URL&&e instanceof URL)&&(e=fetch(e)),__wbg_init_memory(t);const{instance:n,module:r}=await __wbg_load(await e,t);return __wbg_finalize_init(n,r)}export{initSync};export default __wbg_init;