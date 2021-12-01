import React from "react";
import { Link, Outlet } from "react-router-dom";

export function Navigation() {
	return (
		<div>
			<nav>
				<Link to="/">Home</Link> | <Link to="/playground/web3">Web3 (playground)</Link>
			</nav>
			<Outlet />
		</div>
	);
}
