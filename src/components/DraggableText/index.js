import { useEffect } from 'preact';
import interact from 'interactjs';

export const DraggableText = () => {
	useEffect(() => {
		interact('#draggable-text')
			.draggable({
				listeners: {
					move(event) {
						const target = event.target;
						const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
						const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
            
						target.style.transform = `translate(${x}px, ${y}px)`;
            
						target.setAttribute('data-x', x);
						target.setAttribute('data-y', y);
					}
				}
			});
	}, []);

	return (
		<div
			id="draggable-text"
			style={{ position: 'absolute', left: '50px', top: '50px' }}
		>
      Hello, world!
		</div>
	);
};