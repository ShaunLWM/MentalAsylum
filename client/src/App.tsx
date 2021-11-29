import { formatEther } from "@ethersproject/units";
import { useEtherBalance, useEthers } from "@usedapp/core";
import React from "react";

function App() {
  const { activateBrowserWallet, account, deactivate } = useEthers();
  const etherBalance = useEtherBalance(account);

  return (
    <div>
      <div>
        {!account ? (
          <button onClick={() => activateBrowserWallet()}>Connect</button>
        ) : (
          <button onClick={() => deactivate()}>Disconnect</button>
        )}
      </div>
      {account && <p>Account: {account}</p>}
      {etherBalance && <p>Balance: {formatEther(etherBalance)}</p>}
    </div>
  );
}

export default App;
