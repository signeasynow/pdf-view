import __wbg_init from '../../lib/pdf_wasm_project';
import { useEffect } from 'preact/hooks';

function useInitWasm() {
	useEffect(() => {
		async function initWasmAsync() {
			const response = await fetch('lib/pdf_wasm_project_bg.wasm');
			const bufferSource = await response.arrayBuffer();
			
			// Use async init function
			await __wbg_init(bufferSource);
		}
		initWasmAsync();
}, []);

	return null;
}

export default useInitWasm;
