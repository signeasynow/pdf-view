import { createContext } from "preact";
import { useState } from "preact/hooks";

export const FilesContext = createContext({
  files: [],
  setFiles: () => {},
});

export const FilesProvider = ({ children }) => {
	const [files, setFiles] = useState([]);

  return (
    <FilesContext.Provider value={{ files, setFiles }}>
      {children}
    </FilesContext.Provider>
  );
};
