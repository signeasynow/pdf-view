import { useEffect, useState } from 'preact/hooks';

export const useAnnotations = () => {
  const [annotations, setAnnotations] = useState([]);

  useEffect(() => {
    const allAnnotations = [{
      pageNumber: 1,
      content: "Fruityy5",
      x: 60,
      y: 40
    }, {
      pageNumber: 1,
      content: "Fruityy52",
      x: 20,
      y: 100
    }, {
      pageNumber: 4,
      content: "Fruity9",
      x: 80,
      y: 30
    }];
    setAnnotations(allAnnotations)
  }, [annotations]);
  return annotations;
};
