import { useContext, useEffect, useRef, useState } from 'preact/hooks';
import { AnnotationsContext } from '../Contexts/AnnotationsContext';

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
  const { annotations, setAnnotations, annotationsRef } = useContext(AnnotationsContext);

  // not used
  const getActiveAnnotation = (id) => {
    console.log(annotationsRef.current, 'annotationsRef.current2')
    return annotationsRef.current.find((e) => e.id === id);
  }

  useEffect(() => {
    console.log(annotations, 'anot change')
  }, [annotations])

  const moveAnnotation = (data) => {
    console.log(data, 'data moveannot')
    if (!data) {
      return;
    }
    let newData = JSON.parse(JSON.stringify(annotationsRef.current));
    const existingAnnotation = newData.find((e) => e.id === data.id);
    if (!existingAnnotation) {
      return;
    }
    activeAnnotationRef.current = data.id;
    newData = newData.filter((e) => e.id !== data.id);
    newData = [
      ...newData,
      {
        ...existingAnnotation,
        id: existingAnnotation.id,
        pageNumber: data.source.pageIndex + 1, // TODO: Add pageNumber/index
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
    activeAnnotationRef.current = data.id;
    if (!existingAnnotation) {
      // TOTALLY FINE FOR THERE TO BE NONE. return;
    }
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
    const existingAnnotation = newData.find((e) => e.id === id);
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
    setAnnotations(newData);
  }

  return {
    annotations,
    updateAnnotation: throttledUpdateAnnotation,
    moveAnnotation,
    updateAnnotationParam,
    getActiveAnnotation
  }
};
