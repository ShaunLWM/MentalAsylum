import React from "react";
import { Helmet } from "react-helmet-async";

export function PageMeta() {
	return (
		<Helmet>
			<title>Cool Page Title</title>
			<meta property="og:title" content="Cool title for a NFT website" />
			<meta property="og:description" content="Some very long description that we dont know what to write" />
			<meta name="description" content="Some very long description that we dont know what to write" />
			<meta property="og:image" content=":3" />
		</Helmet>
	);
}
