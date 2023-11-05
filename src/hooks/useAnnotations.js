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

export const useAnnotations = (activeAnnotationRef) => {
  const [annotations, setAnnotations] = useState([]);
  const annotationsRef = useRef([]);

  useEffect(() => {
    let allAnnotations = [{
      id: "abc",
      pageNumber: 1,
      content: "dFruityy5",
      x: 0.1,
      y: 0.1,
      color: "#008000",
      fontSize: 28
    }];
    // allAnnotations = [];
    setAnnotations(allAnnotations)
  }, []);

  useEffect(() => {
    console.log(annotations, 'annotations3357')
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
        ...existingAnnotation,
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
    console.log(data, 'data br3')
    let newData = JSON.parse(JSON.stringify(annotationsRef.current));
    const existingAnnotation = newData.find((e) => e.id === data.id);
    // Add back if needed. Not seeing a need. activeAnnotationRef.current = data.id
    if (!existingAnnotation) {
      // TOTALLY FINE FOR THERE TO BE NONE. return;
    }
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
        color: existingAnnotation ? existingAnnotation.color : data.color,
        fontSize: existingAnnotation ? existingAnnotation.fontSize : data.fontSize
      },
    ];

    setAnnotations(newData);
  }, 50);  // 300 ms delay

  const updateAnnotationParam = (id, param) => {
    let newData = JSON.parse(JSON.stringify(annotationsRef.current));
    console.log(id, 'para', param, newData)
    const existingAnnotation = newData.find((e) => e.id === id);
    console.log(existingAnnotation, 'existingAnnotation')
    if (!existingAnnotation) {
      return;
    }
    newData = newData.filter((e) => e.id !== id);
    newData = [
      ...newData,
      {
        ...existingAnnotation,
        ...param
      },
    ];
    console.log(newData, 'newData333')
    setAnnotations(newData);
  }

  console.log(annotations, 'annot335')

  return {
    annotations,
    updateAnnotation: throttledUpdateAnnotation,
    moveAnnotation,
    updateAnnotationParam
  }
};
