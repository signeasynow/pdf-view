/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import ProgressBar from "@ramonak/react-progress-bar";
import { useContext, useState } from 'preact/hooks';
import { Icon } from 'alien35_pdf_ui_lib_2';
import ChevronRight from '../../../../assets/chevron-right-svgrepo-com.svg';
import ChevronLeft from '../../../../assets/chevron-left-svgrepo-com.svg';
import { AnnotationsContext } from '../../../Contexts/AnnotationsContext';
import { supabase } from '../../../utils/supabase';

function generateUUID() {
  let d = new Date().getTime(); //Timestamp
  let d2 = (performance && performance.now && (performance.now()*1000)) || 0; //Time in microseconds since page-load or 0 if unsupported
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      let r = Math.random() * 16; //random number between 0 and 16
      if(d > 0){ //Use timestamp until depleted
          r = (d + r)%16 | 0;
          d = Math.floor(d/16);
      } else { //Use microseconds since page-load if supported
          r = (d2 + r)%16 | 0;
          d2 = Math.floor(d2/16);
      }
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

async function uploadPDF(file, uid, userId) {
  try {
    let bucketName = 'sign-document'; // Replace with your bucket name
    let filePath = `${userId}/${uid}.pdf`; // Replace with desired path in the bucket

    let { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file);

    if (error) {
      throw error;
    }

    console.log('File uploaded successfully', data);
    return data;
  } catch (error) {
    console.error('Error uploading file:', error.message);
  }
}

const visibleSearchWrapper = css`
  background: #f1f3f5;
  width: 300px;
  flex-shrink: 0;
	overflow: hidden;
  flex-grow: 0;
  font-size: 14px;
  color: #5b5b5b;
	z-index: 4;
	position: relative;
`;

const fullSearchWrapper = css`
  background: #f1f3f5;
  width: 100%;
  flex-shrink: 0;
	overflow: hidden;
  flex-grow: 0;
  font-size: 14px;
  color: #5b5b5b;
	z-index: 4;
	position: relative;
`;

const invisibleSearchWrapper = css`
  display: none;
`;

const tagBtnStyle = css`
  background: #fee179;
	margin: 4px;
`

const nextBtn = css`
  display: flex;
  padding: 0 0 0 8px;
  background: #a5bfd7;
  border-radius: 4px;
  border: none;
  align-items: center;
  cursor: pointer;
`

const backBtn = css`
  display: flex;
  padding: 0 8px 0 0;
  background: #a5bfd7;
  border-radius: 4px;
  border: none;
  align-items: center;
  cursor: pointer;
`;

const TagSection = ({
	showFullScreenSearch,
	onClickField,
	showSearch,
  pdfProxyObj,
  customData,
  fileName
}) => {

  const [stage, setStage] = useState(0);

  const { annotationsRef } = useContext(AnnotationsContext);

  const [emailInput, setEmailInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");

  const getWrapperClass = () => {
		if (showFullScreenSearch) {
			return fullSearchWrapper;
		}
		return showSearch ? visibleSearchWrapper : invisibleSearchWrapper;
	}

  const hasNameTag = () => {
    return annotationsRef.current.some((ann) => ann.overlayText === "Name")
  }

  const hasEmailTag = () => {
    return annotationsRef.current.some((ann) => ann.overlayText === "Email")
  }

  const onSend = async () => {
    const buffer = await pdfProxyObj.getData();
    const uuid = generateUUID();
    const doc = await uploadPDF(buffer, uuid, customData?.userId);
    console.log(doc, 'doc33', uuid, buffer)
    if (!doc) {
      alert("Something went wrong. We were unable to upload your PDF.")
      return;
    }
    const { data, error } = await supabase.functions.invoke('create-signing-room', {
      body: {
        senderEmail: customData.email,
        receiverEmail: recipientEmail,
        pdfDocumentPath: `${customData?.userId}/${uuid}`,
        annotations: annotationsRef.current,
        emailField: emailInput,
        nameField: nameInput,
        documentName: fileName
      },
    });
  }

  const onChangeEmailTag = (e) => {
    if (emailInput === recipientEmail) {
      setRecipientEmail(e.target.value);
    }
    setEmailInput(e.target.value);
  }

  if (stage === 0) {
    return (
      <div>
        <div css={getWrapperClass()}>
          <div style={{margin: "12px 4px 8px"}}><ProgressBar completed={33} customLabel="&nbsp;" bgColor="#d9b432" /></div>
          <div style={{margin: "4px"}}>Add markers to the document for your client to click and auto-fill their signature, name, date, and other details.</div>
          <button css={tagBtnStyle} onClick={() => onClickField("Sign")}>Signature</button>
          <button css={tagBtnStyle} onClick={() => onClickField("Name")}>Name</button>
          <button css={tagBtnStyle} onClick={() => onClickField("Email")}>Email</button>
          <button css={tagBtnStyle} onClick={() => onClickField("Date")}>Date</button>
          {
            /*
            <button css={tagBtnStyle} onClick={onEnableClickTagMode}>Turn off edit mode</button>
            */
          }
        </div>
        <div style={{display: "flex", justifyContent: "space-between", padding: "8px 4px", background: "#f1f3f5"}}>
          <div />
          <button css={nextBtn} onClick={() => setStage(1)}><div>Next</div><Icon src={ChevronRight} alt="Right" /></button>
        </div>
      </div>
    );
  }

  if (stage === 1) {
    return (
      <div>
        <div css={getWrapperClass()}>
          <div style={{margin: "12px 4px 8px"}}><ProgressBar completed={67} customLabel="&nbsp;" bgColor="#d9b432" /></div>
          <div style={{margin: "4px"}}>Enter the values for the following fields. These details will populate automatically when a corresponding marker is clicked.</div>
          {
            hasNameTag() && (
              <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} style={{margin: "4px", width: "260px"}} type="text" placeholder="Name" />
            )
          }
          {
            hasEmailTag() && (
              <input value={emailInput} onChange={onChangeEmailTag} style={{margin: "4px", width: "260px"}} type="email" placeholder="Email" />
            )
          }
         
          {
            /*
            <button css={tagBtnStyle} onClick={onEnableClickTagMode}>Turn off edit mode</button>
            */
          }
        </div>
        <div style={{display: "flex", justifyContent: "space-between", padding: "8px 4px", background: "#f1f3f5"}}>
          <button css={backBtn} onClick={() => setStage(0)}><Icon src={ChevronLeft} alt="Right" /><div>Back</div></button>
          <button css={nextBtn} onClick={() => setStage(2)}><div>Next</div><Icon src={ChevronRight} alt="Right" /></button>
        </div>
      </div>
    );
  }

  return (
		<div>
      <div css={getWrapperClass()}>
        <div style={{margin: "12px 4px 8px"}}><ProgressBar completed={98} customLabel="&nbsp;" bgColor="#d9b432" /></div>
        <div style={{margin: "4px"}}>Your document is ready. Enter the recipient's email address to send the document.</div>
        <input value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} style={{margin: "4px", width: "260px"}} type="email" placeholder="Email" />
      </div>
      <div style={{display: "flex", justifyContent: "space-between", padding: "8px 4px", background: "#f1f3f5"}}>
        <button css={backBtn} onClick={() => setStage(1)}><Icon src={ChevronLeft} alt="Right" /><div>Back</div></button>
        <button css={nextBtn} onClick={onSend}><div>Send</div><Icon src={ChevronRight} alt="Right" /></button>
      </div>
    </div>
	);
	
};

export default TagSection;