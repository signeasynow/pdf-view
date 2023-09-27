/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useRef, useState } from 'preact/hooks';

const inputWrapperStyle = css`
  display: flex;
`;

const inputStyle = css`
  width: 100%;
  padding: 4px;
	font-family: Lato;
`;

const aiWrapperStyle = css`
  padding: 8px;
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
`;

const ConversationSection = ({
  onChange,
	onEmbed,
  onSendQuestion, // Assuming this function handles sending the question to AI for answers
}) => {

  const [conversation, setConversation] = useState([]);
  const [rows, setRows] = useState(1);
  const searchTextRef = useRef('');

  const handleSendQuestion = () => {
    const questionText = searchTextRef.current.value;
    onSendQuestion(questionText).then((answerText) => {
      setConversation([
        ...conversation,
        { type: 'question', text: questionText },
        { type: 'answer', text: answerText }
      ]);
      searchTextRef.current.value = '';
      setRows(1);
    });
  };

  const handleChange = (e) => {
    setRows(e.target.value.split('\n').length);
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div css={aiWrapperStyle}>
      <div>
        {/* Display the conversation history */}
        <div>
          {conversation.map((entry, index) => (
            <div key={index}>
              <strong>{entry.type === 'question' ? 'You: ' : 'AI: '}</strong>
              {entry.text}
            </div>
          ))}
        </div>
				<button onClick={onEmbed}>Embed</button>

        {/* Input area */}
        <div css={inputWrapperStyle}>
          <textarea
            css={inputStyle}
            ref={searchTextRef}
            rows={rows}
            onChange={handleChange}
            placeholder={"Ask your document a question"}
          />
          <button onClick={handleSendQuestion}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default ConversationSection;
