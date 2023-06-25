import { h, Component } from 'preact';
import 'pdfjs-dist/web/pdf_viewer.css';
import Hand from '../assets/hand.svg';
// import Pan from "./assets/pan.svg";

const Header = () => {

  return (
    <div id="controls">
      <button>Menu</button>
      |
      <button>Panel</button>
      <button>View controls</button>
      |
      <button id="zoomIn">Zoom In</button>
      <button id="zoomOut">Zoom Out</button>
      <button>Pan</button>
      <img src={Hand} alt="Hand" />
      
      <select>
        <option>View</option>
        <option>Annotate</option>
      </select>
      <button>Search</button>
      <button>Comments</button>
    </div>
  );
};

export default Header;