import { useContext, useEffect, useState } from 'preact/hooks';
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
	const getActiveAnnotation = (id) => annotationsRef.current.find((e) => e.id === id);

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
				content: existingAnnotation.content
			}
		];
		setAnnotations(newData);
		cb(newData);
	};

	const removeAnnotation = (id) => {
		if (!id) {
			return;
		}
		let newData = JSON.parse(JSON.stringify(annotationsRef.current));
		newData = newData.filter((e) => e.id !== id);
		setAnnotations(newData);
	};

	const updateFreeTextAnnotation = (data, text) => {
		let newData = JSON.parse(JSON.stringify(annotationsRef.current));
		const existingAnnotation = newData.find((e) => e.id === data.id);
		activeAnnotationRef.current = data.id;
		if (!existingAnnotation) {
			// TOTALLY FINE FOR THERE TO BE NONE.
		}
		newData = newData.filter((e) => e.id !== data.id);
		const dataPayload = {
			id: data.id,
			pageNumber: data.pageIndex + 1,
			x: existingAnnotation ? existingAnnotation.x : data.x,
			y: existingAnnotation ? existingAnnotation.y : data.y,
			content: text,
			moveDisabled: existingAnnotation ? existingAnnotation.moveDisabled : data.moveDisabled,
			color: existingAnnotation ? existingAnnotation.color : data.color,
			fontSize: existingAnnotation ? existingAnnotation.fontSize : data.fontSize,
			fontFamily: existingAnnotation ? existingAnnotation.fontFamily : data.fontFamily,
			name: 'freeTextEditor'
		}
		newData = [
			...newData,
			dataPayload
		];
		const operationPayload = {
			pageIndex: data.pageIndex,
			...dataPayload
		};
		const operation = { action: 'update-annotation', data: operationPayload };
		if (isManuallyAddingImageRef.current) {
			// addOperation(operation);
			isManuallyAddingImageRef.current = false;
		}
		setAnnotations(newData);
	};

	const updateSignatureAnnotation = (data) => {
		let updatedAnnotations = JSON.parse(JSON.stringify(annotationsRef.current));
		const existingAnnotation = updatedAnnotations.find((e) => e.id === data.id);
		activeAnnotationRef.current = data.id;
		if (!existingAnnotation) {
			// TOTALLY FINE FOR THERE TO BE NONE.
		}
		const pastAnnotations = updatedAnnotations.filter((e) => e.id !== data.id);
		const dataPayload = {
			height: typeof data.height === "number" ? data.height : existingAnnotation?.height,
			width: typeof data.width === "number" ? data.width : existingAnnotation?.width,
			id: data.id,
			pageNumber: data.pageIndex + 1,
			x: typeof data.x === "number" ? data.x : existingAnnotation?.x,
			y: typeof data.y === "number" ? data.y : existingAnnotation?.y,
			urlPath: data.urlPath,
			overlayText: data.overlayText ? data.overlayText : existingAnnotation?.overlayText,
			moveDisabled: data.moveDisabled ? data.moveDisabled : existingAnnotation?.moveDisabled,
			name: 'stampEditor'
		};
		updatedAnnotations = [
			...pastAnnotations,
			dataPayload
		];
		const operationPayload = {
			pageIndex: data.pageIndex,
			...dataPayload
		};
		const operation = { action: 'update-annotation', data: operationPayload };
		if (isManuallyAddingImageRef.current) {
			addOperation(operation);
			isManuallyAddingImageRef.current = false;
		}
		setAnnotations(updatedAnnotations);
	};

	const [updateQueue, setUpdateQueue] = useState([]);

	const addToQueue = (data, text, type) => {
		setUpdateQueue(queue => [...queue, { data, text, type }]);
	};

	const processQueue = () => {
		if (updateQueue.length === 0) return;

		const { data, text, type } = updateQueue[0];
		switch (type) {
			case 'freeTextEditor':
				updateFreeTextAnnotation(data, text);
				break;
			case 'stampEditor':
				updateSignatureAnnotation(data);
				break;
      // ... other cases
		}

		// Remove the processed item from the queue
		setUpdateQueue(queue => queue.slice(1));
	};

	useEffect(() => {
		if (updateQueue.length > 0) {
			const timer = setTimeout(processQueue, 50); // Process queue with delay
			return () => clearTimeout(timer);
		}
	}, [updateQueue]);

	const throttledUpdateAnnotation = (data, text) => {
		if (!data) {
			return;
		}
		const type = data.name;
		// Add to queue
		addToQueue(data, text, type);
	};

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
		const payload = {
			pageIndex: typeof updatedParams?.pageNumber === "number" ? updatedParams.pageNumber - 1 : existingAnnotation.pageNumber - 1,
			...existingAnnotation,
			...updatedParams
		}
		const operation = { action: 'update-annotation', data: payload };
		addOperation(operation);
		setAnnotations(newData);
	};

	const throttledResizeAnnotation = debounce((data) => {
		updateAnnotationParam(data.id, {
			width: data.width,
			height: data.height,
			x: data.source.x,
			y: data.source.y
		});
	}, 50);


	return {
		annotations,
		annotationsRef,
		updateAnnotation: throttledUpdateAnnotation,
		moveAnnotation,
		removeAnnotation,
		updateAnnotationParam,
		getActiveAnnotation,
		resizeAnnotation: throttledResizeAnnotation
	};
};
