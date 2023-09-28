/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useRef, useState } from 'preact/hooks';
import RobotIcon from '../../../assets/zap-svgrepo-com.svg';
import UserIcon from '../../../assets/user-svgrepo-com.svg';
import { Icon } from "aleon_35_pdf_ui_lib";

const inputWrapperStyle = css`
  display: flex;
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
	font-family: Lato;
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
	onEmbed,
  onAskQuestion,
  onSendQuestion, // Assuming this function handles sending the question to AI for answers
}) => {

  const [conversation, setConversation] = useState(JSON.parse(localStorage.getItem('conversation')) || []);
  const [rows, setRows] = useState(1);
  const searchTextRef = useRef('');

  const conversationContainerRef = useRef(null); // New ref for the conversation container

  useEffect(() => {
    // Scroll to the bottom when the component mounts
    if (conversationContainerRef.current) {
      conversationContainerRef.current.scrollTop = conversationContainerRef.current.scrollHeight;
    }
  }, []); // Empty dependency array means this runs once when the component mounts

  useEffect(() => {
    localStorage.setItem('conversation', JSON.stringify(conversation));

    if (conversationContainerRef.current) {
      conversationContainerRef.current.scrollTop = conversationContainerRef.current.scrollHeight;
    }
  }, [conversation]);

  const handleSendQuestion = () => {
    const questionText = searchTextRef.current.value;
    onAskQuestion(questionText).then((answerText) => {
      console.log(answerText, 'answer text down here')
      setConversation([
        ...conversation,
        { type: 'question', text: questionText },
        { type: 'answer', text: answerText.answer }
      ]);
      searchTextRef.current.value = '';
      setRows(1);
    });
  };

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

  const inputRef = useRef(null); // New Ref to track input container

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

  return (
    <div css={aiWrapperStyle}>
      <div>
        {/* Display the conversation history */}
        <div ref={conversationContainerRef} style={{marginBottom: 30 * rows}} css={conversationContainerStyle}>
          <div css={conversationContentStyle}>
            {conversation.map((entry, index) => (
              <div css={conversationEntryStyle} key={index}>
                {entry.type === "question" ? <Icon src={UserIcon}/> : <Icon src={RobotIcon}/>}
                {entry.text}
              </div>
            ))}
          </div>
        </div>
				<button onClick={onEmbed}>Embed</button>
        
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
            <button style={{fontSize: 16}} onClick={handleSendQuestion}>⮕</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationSection;
