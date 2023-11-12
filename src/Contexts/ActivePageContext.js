import { createContext } from "preact";
import { useState } from "preact/hooks";

export const ActivePageContext = createContext({
  activePageIndex: [],
  setActivePageIndex: () => {},
});

export const ActivePageProvider = ({ children }) => {
	const [activePageIndex, setActivePageIndex] = useState(0);

  return (
    <ActivePageContext.Provider value={{ activePageIndex, setActivePageIndex }}>
      {children}
    </ActivePageContext.Provider>
  );
};
