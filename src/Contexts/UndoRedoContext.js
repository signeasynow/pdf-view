import { createContext } from "preact";
import { useContext, useEffect, useRef, useState } from "preact/hooks";
import { FilesContext } from "./FilesContext";
import { ActivePageContext } from "./ActivePageContext";

const initialRedoUndoObject = (files) => {
  if (!files) {
    return {};
  }
  const result = {};
  for (let i = 0; i < files.length; i ++) {
    result[i] = [];
  }
  return result;
};

export const UndoRedoContext = createContext({
  operations: {},
  redoStack: {},
  setOperations: () => {},
  setRedoStack: () => {},
});

export const UndoRedoProvider = ({ children }) => {
  const { files } = useContext(FilesContext);
  const { activePageIndex } = useContext(ActivePageContext);
  
	const [operations, setOperations] = useState(initialRedoUndoObject(files));
	const [redoStack, setRedoStack] = useState(initialRedoUndoObject(files));
  console.log(operations, 'operations99')
  const addOperation = (operation) => {
    console.log(operation, 'opera3', operations, 'act', activePageIndex);
    const activePageOps = operations?.[activePageIndex] || [];
		setOperations({
			...operations,
			[activePageIndex]: [...activePageOps, operation]
		});
		setRedoStack(initialRedoUndoObject());
	}

  return (
    <UndoRedoContext.Provider value={{ operations, setOperations, redoStack, setRedoStack, addOperation }}>
      {children}
    </UndoRedoContext.Provider>
  );
};
