import { createContext } from "preact";
import { useContext, useEffect, useRef, useState } from "preact/hooks";
import { FilesContext } from "./FilesContext";

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
	const [operations, setOperations] = useState(initialRedoUndoObject(files));
	const [redoStack, setRedoStack] = useState(initialRedoUndoObject(files));

  return (
    <UndoRedoContext.Provider value={{ operations, setOperations, redoStack, setRedoStack }}>
      {children}
    </UndoRedoContext.Provider>
  );
};
