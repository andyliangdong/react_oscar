import React from 'react';
import { createRoot } from 'react-dom/client';

import 'antd/dist/antd.css';
import "bootstrap/dist/css/bootstrap.min.css";
import 'mdb-react-ui-kit/dist/css/mdb.min.css'

import App from './App';

const rootElement = document.getElementById("root");
const root = createRoot(rootElement)
root.render(<App />);