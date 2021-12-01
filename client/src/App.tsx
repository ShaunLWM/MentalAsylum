import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { HomeScreen } from "./pages/HomeScreen";
import { Web3Page } from "./pages/playground/Web3Page";

/*
Path we need:
1. /mint

Optional path  we need:
1. /roadmap
2. /stake
*/

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Navigation />}>
					<Route index element={<HomeScreen />} />
					<Route path="playground">
						<Route path="web3" element={<Web3Page />} />
					</Route>
				</Route>
			</Routes>
		</BrowserRouter>
	);
}

export default App;
