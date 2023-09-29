/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useRef, useState } from 'preact/hooks';
import RobotIcon from '../../../assets/zap-svgrepo-com.svg';
import UserIcon from '../../../assets/user-svgrepo-com.svg';
import { Icon } from "aleon_35_pdf_ui_lib";
import { LoadingSpinner } from '../LoadingSpinner';
import { separateCitation } from '../../utils/separateCitation';

const conversationContainerStyle = css`
padding: 8px;
position: absolute;
top: 0;
bottom: 0;
overflow-y: auto;
left: 0;
right: 0;
margin-top: 60px;
`;

const closeBtnStyle = css`
  border: 1px solid lightgrey;
  font-size: 16px;
  padding: 8px 16px;
  border-radius: 4px;
  margin-left: 8px;
  cursor: pointer;
`

const disclaimerStyle = css`
  margin: 4px 2px;
  font-size: 10px;
  text-align: center;
`

const citationStyle = css`
color: #0b6fcc;
font-style: italic;
cursor: pointer;
`

const inputWrapperStyle = css`
  display: flex;
  margin: 0 2px;
`;

const conversationContentStyle = css`
  flex-grow: 1;
`;

const conversationEntryStyle = css`
  word-wrap: break-word;
  white-space: pre-wrap;
  margin-bottom: 20px;
  line-height: 1.8;
`;

const inputContainerStyle = css`
  flex-shrink: 0; /* Prevents the input from shrinking */
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
`;

const inputStyle = css`
  width: 100%;
  padding: 4px;
  font-size: 16px;
  resize: none; // disable resizing
`;

const aiWrapperStyle = css`
  padding: 8px;
  display: flex;
  flex-direction: column;
  height: 100%;
  font-size: 16px;
`;


const ConversationSection = ({
  onChange,
  onFindCitation,
  handleSendQuestion,
  loading,
  rows,
  conversationContainerRef,
  setRows,
  conversation,
  aiDocHash,
  currentAiDocHash,
  onNoToAiWarning,
  onYesToWarning
}) => {

  const [showWrongDocWarning, setShowWrongDocWarning] = useState(true);

  useEffect(() => {
    if (!aiDocHash || !currentAiDocHash) {
      return;
    }
    if (aiDocHash !== currentAiDocHash) {
      setShowWrongDocWarning(true);
    }
  }, [aiDocHash, currentAiDocHash])
  const searchTextRef = useRef('');

  const handleChange = (e) => {
    const text = e.target.value;
    const lines = text.split('\n');
    let totalVisualLines = 0;
    const maxCharsPerLine = 27;
  
    for (const line of lines) {
      const lineLength = line.length;
      if (lineLength === 0) {
        totalVisualLines += 1; // For empty lines
      } else {
        totalVisualLines += Math.ceil(lineLength / maxCharsPerLine);
      }
    }
  
    setRows(Math.min(totalVisualLines, 5));
  
    if (onChange) {
      onChange(e);
    }
  };

  useEffect(() => {
    localStorage.setItem('conversation', JSON.stringify(conversation));

    if (conversationContainerRef.current) {
      conversationContainerRef.current.scrollTop = conversationContainerRef.current.scrollHeight;
    }
  }, [conversation]);

	useEffect(() => {
    // Scroll to the bottom when the component mounts
    if (conversationContainerRef.current) {
      conversationContainerRef.current.scrollTop = conversationContainerRef.current.scrollHeight;
    }
  }, []); // Empty dependency array means this runs once when the component mounts
  
  const handleSubmit = () => {
    const qText = searchTextRef.current.value;
    handleSendQuestion(qText);
    searchTextRef.current.value = "";
  }
  
  const onNoToWarning = () => {
    setShowWrongDocWarning(false);
    onNoToAiWarning();
  }

  const inputRef = useRef(null); // New Ref to track input container

  if (showWrongDocWarning) {
    return (
      <div style={{margin: 4, alignItems: "center", display: "flex", flexDirection: "column"}}>
        <div>Document updated. Answers may refer to the previous version. Regenerate AI for current document?</div>
        <div>
          <button onClick={onYesToWarning} css={closeBtnStyle}>Yes</button>
          <button onClick={onNoToWarning} css={closeBtnStyle}>No</button>
        </div>
      </div>
    )
  }
  return (
    <div css={aiWrapperStyle}>
      <div>
        {/* Display the conversation history */}
        <div ref={conversationContainerRef} style={{marginBottom: (30 * rows) + 20}} css={conversationContainerStyle}>
          <div css={conversationContentStyle}>
            {conversation.map((entry, index) => (
              <div css={conversationEntryStyle} key={index}>
                {entry.type === "question" ? <Icon clickable={false} src={UserIcon}/> : <Icon src={RobotIcon}/>}
                <div>{separateCitation(entry.text).main}</div>
                {console.log(separateCitation(entry.text), 'ttt')}
                {
                  !!separateCitation(entry.text).citations?.length && separateCitation(entry.text).citations.map((citation) => (
                    <div onClick={() => onFindCitation({
                      target: {
                        value: citation
                      }
                    })} css={citationStyle}>‟{citation}”</div>
                  ))
                }
              </div>
            ))}
          </div>
        </div>
				{/*<button onClick={onEmbed}>Embed</button>*/}
        <div css={inputContainerStyle}>
          {/* Input area */}
          <div ref={inputRef} css={inputWrapperStyle}>
            <textarea
              css={inputStyle}
              ref={searchTextRef}
              rows={rows}
              onChange={handleChange}
              placeholder={"Ask your document a question"}
            />
            <button disabled={loading} style={{cursor: "pointer", fontSize: 16, border: "none", borderBottomRightRadius: "2px", borderTopRightRadius: "2px", color: "white", background: "#3183c8"}} onClick={handleSubmit}>{loading ? <LoadingSpinner size="sm" /> : "⮕"}</button>
          </div>
          <p css={disclaimerStyle}>AI may produce inaccurate information and citations.</p>
        </div>
      </div>
    </div>
  );
};

export default ConversationSection;
