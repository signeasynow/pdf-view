import { useCallback } from 'react';
import BookmarkIconUrl from '../../assets/bookmark-fill-svgrepo-com.svg';  // Update path if needed

function usePdfBookmarks() {
  const applyBookmarkButtons = useCallback((toggleBookmark) => {
    // Wait for pages to render
    // Find all page elements
    const pageElements = document.querySelectorAll('.page');

    // Add a bookmark icon to each page
    pageElements.forEach((pageElement, index) => {
      // Create a bookmark icon element
      const bookmarkIcon = document.createElement('img');
      bookmarkIcon.src = BookmarkIconUrl;
      bookmarkIcon.style.position = 'absolute';
      bookmarkIcon.style.top = '10px';
      bookmarkIcon.style.right = '10px';
      bookmarkIcon.style.zIndex = 9999999;
      bookmarkIcon.style.width = '40px';
      bookmarkIcon.style.cursor = 'pointer';
      bookmarkIcon.onclick = () => toggleBookmark(index + 1);  // Bookmarking function to be defined
      bookmarkIcon.className = `bookmark-icon bookmark-icon-${index + 1}`;  // Add a unique class name

      // Add the bookmark icon to the page
      pageElement.appendChild(bookmarkIcon);
    });
  }, []);

  const removeBookmarkButtons = useCallback(() => {
    const bookmarkIcons = document.querySelectorAll('.bookmark-icon');

    bookmarkIcons.forEach((bookmarkIcon) => {
      bookmarkIcon.parentNode.removeChild(bookmarkIcon);
    });
  }, []);

  return {
    applyBookmarkButtons,
    removeBookmarkButtons
  };
}

export default usePdfBookmarks;
