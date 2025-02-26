/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useState } from 'react';
import usePdfBookmarks from '../../hooks/usePdfBookmarks';
import BookmarkIconFilledUrl from '../../../assets/bookmark-svgrepo-com.svg';  // Update path if needed
import BookmarkIconUrl from '../../../assets/bookmark-fill-svgrepo-com.svg';  // Update path if needed
import Dropdown from '../Dropdown';
import Gear from '../../../assets/gear-svgrepo-com.svg';
import { Icon } from 'alien35_pdf_ui_lib_2';

const optionsWrapper = css`
  display: flex;
`;

const bookmarkContainerStyle = css`
  display: flex;
`;

const BookmarksSection = ({
	pdf,
	setActivePage
}) => {

	const [isRenaming, setIsRenaming] = useState(false);
	const [newTitle, setNewTitle] = useState(page.title);

	const [bookmarkedPages, setBookmarkedPages] = useState([]);

	const { applyBookmarkButtons, removeBookmarkButtons } = usePdfBookmarks();
	const [isDropdownVisible, setIsDropdownVisible] = useState(false);

	const toggleBookmark = (pageNumber) => {
		setBookmarkedPages(prevBookmarkedPages => {
			const pageIndex = prevBookmarkedPages.map((page) => page.pageNumber).indexOf(pageNumber);
			if (pageIndex > -1) {
				// If the page is already bookmarked, remove the bookmark
				// Also, change the bookmark icon to the unfilled version
				document.querySelector(`.bookmark-icon-${pageNumber}`).src = BookmarkIconUrl;
				return prevBookmarkedPages.filter(page => page.pageNumber !== pageNumber);
			}
			// If the page is not bookmarked, add the bookmark
			// Also, change the bookmark icon to the filled version
			document.querySelector(`.bookmark-icon-${pageNumber}`).src = BookmarkIconFilledUrl;
			return [...prevBookmarkedPages, {
				pageNumber,
				title: 'Untitled'
			}];
      
		});
	};

	const onClick = (e) => {
		if (!e.target?.checked) {
			removeBookmarkButtons();
		}
		else {
			applyBookmarkButtons(toggleBookmark);
		}
	};

	return (
		<>
			<h3>Bookmarks</h3>
			<div css={optionsWrapper}>
				<input onChange={onClick} id="view-bookmark" type="checkbox" />
				<label htmlFor="view-bookmark">View bookmark on page</label>
			</div>
			{
				bookmarkedPages.map((page) => {

					const handleRename = () => {
						setIsRenaming(true);
					};

					const handleSave = () => {
						setIsRenaming(false);
						setBookmarkedPages(prevBookmarkedPages => prevBookmarkedPages.map(prevPage => {
							if (prevPage.pageNumber === page.pageNumber) {
								return { ...prevPage, title: newTitle };
							}
							return prevPage;
						}));
					};

					const handleCancel = () => {
						setIsRenaming(false);
						setNewTitle(page.title);  // Revert the newTitle to the current title
					};

					const handleTitleChange = (e) => {
						setNewTitle(e.target.value);
					};

					return (
						<div
							onMouseEnter={() => setIsDropdownVisible(true)}
							onMouseLeave={() => setIsDropdownVisible(false)}
							css={bookmarkContainerStyle}
							key={page.pageNumber}
						>
							<div
								onClick={() => {
									setActivePage(page.pageNumber);
									pdf.scrollPageIntoView({
										pageNumber: page.pageNumber
									});
								}}
							>
								<h3>Page {page.pageNumber}</h3>
								{
									isRenaming ? (
										<div>
											<input
												type="text"
												value={newTitle}
												onChange={handleTitleChange}
											/>
											<button onClick={handleSave}>Save</button>
											<button onClick={handleCancel}>Cancel</button>
										</div>
									) : (
										<p>{page.title}</p>
									)
								}
							</div>
							{
								!isRenaming && isDropdownVisible && (
									<Dropdown title={<Icon src={Gear} alt="View controls" />}
										child={<div>
											<p onClick={handleRename}>Rename</p>
											<p onClick={() => toggleBookmark(page.pageNumber)}>Delete</p>
										</div>}
									/>
								)
							}
						</div>
					);
				})
			}
		</>
	);
};

export default BookmarksSection;
