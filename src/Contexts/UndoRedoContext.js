import { createContext } from 'preact';
import { useContext, useEffect, useRef, useState } from 'preact/hooks';
import { FilesContext } from './FilesContext';
import { ActivePageContext } from './ActivePageContext';

const initialRedoUndoObject = (files) => {
	const result = {};
	if (!files?.length) {
		return { 0: [] };
	}
	for (let i = 0; i < files.length; i ++) {
		result[i] = [];
	}
	return result;
};

export const UndoRedoContext = createContext({
	annotations: [],
	setAnnotations: () => {},
	annotationsRef: { current: [] }
});

export const UndoRedoProvider = ({ children }) => {
	const { files } = useContext(FilesContext);
	const { activePageIndex } = useContext(ActivePageContext);
  
	const [operations, setOperations] = useState(initialRedoUndoObject(files));
	const [redoStack, setRedoStack] = useState(initialRedoUndoObject(files));

	console.log('operations: ', operations, 'redoStack: ', redoStack);
	const operationsRef = useRef(operations);
	const redoStackRef = useRef(redoStack);

	useEffect(() => {
		operationsRef.current = operations;
	}, [operations]);

	useEffect(() => {
		redoStackRef.current = redoStack;
	}, [redoStack]);

	// todo: add effect for files change.
  
	const addOperation = (operation) => {
		const activePageOps = operationsRef.current?.[activePageIndex] || [];

		const topOperation = getTopOperation();
		if (areOperationsIdentical(topOperation?.data, operation?.data)) {
			return;
		}
		setOperations({
			...operations,
			[activePageIndex]: [...activePageOps, operation]
		});
		setRedoStack(initialRedoUndoObject());
	};

	const getTopOperation = () => {
		const activePageOps = operationsRef?.current?.[activePageIndex];
		if (activePageOps && activePageOps.length > 0) {
			return activePageOps[activePageOps.length - 1];
		}
		return null;
	};

	const areOperationsIdentical = (op1, op2) => {
		if (!op1 || !op2) return false;

		const stringifySorted = (obj) => JSON.stringify(obj, Object.keys(obj).sort());
		return stringifySorted(op1) === stringifySorted(op2);
	};

	return (
		<UndoRedoContext.Provider value={{ operations, setOperations, redoStack, setRedoStack, addOperation, getTopOperation, areOperationsIdentical }}>
			{children}
		</UndoRedoContext.Provider>
	);
};
