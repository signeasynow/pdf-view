import { useEffect, useRef, useState } from 'preact/hooks';

const debounce = (func, delay) => {
  let timerId;
  return (...args) => {
    if (timerId) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

export const useAnnotations = () => {
  const [annotations, setAnnotations] = useState([]);
  const annotationsRef = useRef([]);

  useEffect(() => {
    let allAnnotations = [{
      id: "abc",
      pageNumber: 1,
      content: "dFruityy5",
      x: 0.1,
      y: 0.1
    }];
    // allAnnotations = [];
    setAnnotations(allAnnotations)
  }, []);

  useEffect(() => {
    annotationsRef.current = annotations;
  }, [annotations])

  const moveAnnotation = (data) => {
    if (!data) {
      return;
    }
    console.log(annotations, 'annot33', data);
    let newData = JSON.parse(JSON.stringify(annotationsRef.current));
    const existingAnnotation = newData.find((e) => e.id === data.id);
    if (!existingAnnotation) {
      return;
    }
    newData = newData.filter((e) => e.id !== data.id);
    newData = [
      ...newData,
      {
        id: existingAnnotation.id,
        pageNumber: 1, // TODO: Add pageNumber/index
        x: data.x,
        y: data.y,
        content: existingAnnotation.content,
      },
    ];

    setAnnotations(newData);
  }

  const throttledUpdateAnnotation = debounce((data, text) => {
    if (!data) {
      return;
    }

    let newData = JSON.parse(JSON.stringify(annotationsRef.current));
    const existingAnnotation = newData.find((e) => e.id === data.id);
    console.log(existingAnnotation, 'existingAnnotation2')
    newData = newData.filter((e) => e.id !== data.id);
    newData = [
      ...newData,
      {
        id: data.id,
        pageNumber: data.pageIndex + 1,
        x: existingAnnotation ? existingAnnotation.x : data.x,
        y: existingAnnotation ? existingAnnotation.y : data.y,
        content: text,
      },
    ];

    setAnnotations(newData);
  }, 50);  // 300 ms delay

  console.log(annotations, 'annot335')

  return {
    annotations,
    updateAnnotation: throttledUpdateAnnotation,
    moveAnnotation
  }
};
