import { ChainId, Config, DAppProvider } from '@usedapp/core';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';

const config: Config = {
  readOnlyChainId: ChainId.Localhost,
  readOnlyUrls: {
    [ChainId.Localhost]: 'http://127.0.0.1:8545',
  },
  multicallAddresses: {
    // replace with your own multicall
    [ChainId.Localhost]: '0x0'
  }
}

ReactDOM.render(
  <React.StrictMode>
    <DAppProvider config={config}>
      <App />
    </DAppProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
