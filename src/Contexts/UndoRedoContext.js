import { createContext } from "preact";
import { useContext, useEffect, useRef, useState } from "preact/hooks";
import { FilesContext } from "./FilesContext";
import { ActivePageContext } from "./ActivePageContext";

const initialRedoUndoObject = (files) => {
  const result = {};
  for (let i = 0; i < files.length; i ++) {
    result[i] = [];
  }
  return result;
};

export const UndoRedoContext = createContext({
  annotations: [],
  setAnnotations: () => {},
  annotationsRef: { current: [] },
});

export const UndoRedoProvider = ({ children }) => {
  const { files } = useContext(FilesContext);
  const { activePageIndex } = useContext(ActivePageContext);
  
	const [operations, setOperations] = useState(initialRedoUndoObject(files));
	const [redoStack, setRedoStack] = useState(initialRedoUndoObject(files));

  const addOperation = (operation) => {
		setOperations({
			...operations,
			[activePageIndex]: [...operations[activePageIndex], operation]
		});
		setRedoStack(initialRedoUndoObject());
	}

  return (
    <UndoRedoContext.Provider value={{ operations, setOperations, redoStack, setRedoStack, addOperation }}>
      {children}
    </UndoRedoContext.Provider>
  );
};
