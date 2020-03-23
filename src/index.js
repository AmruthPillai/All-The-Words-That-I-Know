import React from 'react';
import ReactDOM from 'react-dom';

import * as serviceWorker from './serviceWorker';
import './tailwind/tailwind.css';
import './index.css';

import Navbar from './shared/Navbar/Navbar';
import Game from './shared/Game/Game';

ReactDOM.render(
  <React.StrictMode>
    <div className="container w-11/12">
      <Navbar />
      <Game />
    </div>
  </React.StrictMode>,
  document.getElementById('root'),
);

serviceWorker.register();
