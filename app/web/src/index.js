import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);
root.render(<Main />);
function Main() {
  return(
    // <div>
    //   <h1>Hello, world!</h1>
    //   <p>This is a simple React app.</p>
    // </div>
  // <React.StrictMode>
    <App />
  // {/* </React.StrictMode> */}
  )
  }
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
