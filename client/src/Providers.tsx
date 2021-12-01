import { HelmetProvider } from "react-helmet-async";
import React from "react";
import { ChainId, Config, DAppProvider } from "@usedapp/core";

interface Props {
	children: JSX.Element;
}

const config: Config = {
	readOnlyChainId: ChainId.Localhost,
	readOnlyUrls: {
		[ChainId.Localhost]: "http://127.0.0.1:8545",
	},
	multicallAddresses: {
		// replace with your own multicall
		[ChainId.Localhost]: "0x0",
	},
};

export function Providers({ children }: Props) {
	return (
		<HelmetProvider>
			<DAppProvider config={config}>{children}</DAppProvider>
		</HelmetProvider>
	);
}
