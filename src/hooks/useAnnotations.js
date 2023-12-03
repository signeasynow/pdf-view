import { useContext } from 'preact/hooks';
import { AnnotationsContext } from '../Contexts/AnnotationsContext';
import { UndoRedoContext } from '../Contexts/UndoRedoContext';

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

export const useAnnotations = (activeAnnotationRef, isManuallyAddingImageRef) => {
  const { annotations, setAnnotations, annotationsRef } = useContext(AnnotationsContext);
  const { addOperation } = useContext(UndoRedoContext);
  // not used
  const getActiveAnnotation = (id) => {
    return annotationsRef.current.find((e) => e.id === id);
  }

  const moveAnnotation = (data, cb) => {
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
    cb(newData);
  }

  const removeAnnotation = (id) => {
    if (!id) {
      return;
    }
    let newData = JSON.parse(JSON.stringify(annotationsRef.current));
    newData = newData.filter((e) => e.id !== id);
    setAnnotations(newData);
  }

  const updateFreeTextAnnotation = (data, text) => {
    // console.log(data, 'data444', data.content, 'dd', data?.source?.content, 'dg', text)
    let newData = JSON.parse(JSON.stringify(annotationsRef.current));
    const existingAnnotation = newData.find((e) => e.id === data.id);
    activeAnnotationRef.current = data.id;
    if (!existingAnnotation) {
      // TOTALLY FINE FOR THERE TO BE NONE.
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
        fontSize: existingAnnotation ? existingAnnotation.fontSize : data.fontSize,
        name: "freeTextEditor"
      },
    ];

    setAnnotations(newData);
  }

  console.log(annotations, 'annotati33')

  const updateSignatureAnnotation = (data) => {
    let newData = JSON.parse(JSON.stringify(annotationsRef.current));
    const existingAnnotation = newData.find((e) => e.id === data.id);
    activeAnnotationRef.current = data.id;
    if (!existingAnnotation) {
      // TOTALLY FINE FOR THERE TO BE NONE.
    }
    newData = newData.filter((e) => e.id !== data.id);
    newData = [
      ...newData,
      {
        height: existingAnnotation ? existingAnnotation.height : data.height,
        width: existingAnnotation ? existingAnnotation.width : data.width,
        id: data.id,
        pageNumber: data.pageIndex + 1,
        x: existingAnnotation ? existingAnnotation.x : data.x,
        y: existingAnnotation ? existingAnnotation.y : data.y,
        urlPath: data.urlPath,
        overlayText: existingAnnotation ? existingAnnotation.overlayText : data.overlayText,
        moveDisabled: existingAnnotation ? existingAnnotation.moveDisabled : data.moveDisabled,
        name: "stampEditor"
      },
    ];
    setAnnotations(newData);
  }

  const throttledUpdateAnnotation = debounce((data, text) => {
    console.log(data, 'data333', data.height)
    if (!data) {
      return;
    }
    switch (data.name) {
      case "freeTextEditor": {
        updateFreeTextAnnotation(data, text);
        break;
      }
      case "stampEditor": {
        updateSignatureAnnotation(data);
        break;
      }
    }
    const payload = {
			height: data.height,
			width: data.width,
			id: data.id,
			pageIndex: data.pageIndex,
			pageNumber: data.pageIndex + 1,
			x: data.x,
			y: data.y,
			urlPath: data.urlPath,
			name: data.name,
			content: data.content,
			color: data.color,
			fontSize: data.fontSize,
			overlayText: data.overlayText,
			moveDisabled: data.moveDisabled
		}
		const operation = { action: "update-annotation", data: payload };
		// we are adding an excessive operation here when it's due to a redo
		
		if (isManuallyAddingImageRef.current) {
			addOperation(operation);
			isManuallyAddingImageRef.current = false;
		}
  }, 50);

  const updateAnnotationParam = (id, ...params) => {
    let newData = JSON.parse(JSON.stringify(annotationsRef.current));
    const existingAnnotation = newData.find((e) => e.id === id);
    if (!existingAnnotation) {
      return;
    }
  
    // Merging all params into one object
    const updatedParams = params.reduce((acc, param) => ({ ...acc, ...param }), {});
  
    // Updating the specific annotation
    newData = newData.map(annotation => 
      annotation.id === id ? { ...annotation, ...updatedParams } : annotation
    );
    setAnnotations(newData);
  };

  const throttledResizeAnnotation = debounce((data) => {
    console.log(data, 'resize2')
    updateAnnotationParam(data.id, {
      width: data.width,
      height: data.height,
      x: data.source.x,
      y: data.source.y
    })
  }, 50);


  return {
    annotations,
    updateAnnotation: throttledUpdateAnnotation,
    moveAnnotation,
    removeAnnotation,
    updateAnnotationParam,
    getActiveAnnotation,
    resizeAnnotation: throttledResizeAnnotation
  }
};
