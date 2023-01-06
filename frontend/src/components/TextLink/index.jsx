/* eslint-disable react/jsx-no-target-blank */
import { Link } from "@mui/material";
import { NavLink as RouterLink } from "react-router-dom";
import { OpenInNew } from "@mui/icons-material";
import pages from "../../pages/pages";
import React from "react";
// import { changeTab } from "../Navbar";

/**
 * A link
 * @param {Object} props The props
 * @param {React.ReactNode} props.children The link's children
 * @param {string} props.href The link's href
 * @param {boolean} props.external If true, the link will open in a new tab
 * @param {React.Ref} props.forwardedRef A ref to pass to the link
 * @param {boolean} props.noIcon If true, the external icon will not be shown
 * @param {Object} props.props Any other props
 * @returns {JSX.Element} A link
 */
const TextLink = ({ children, href, external, forwardedRef, noIcon, ...props }) => {
	/** If the link is internal to the website or not, determined by whether the link is in the pages array */
	const isInternalLink = pages.find(el => el["path"] === (href));

	return (
		// !!
		<Link
			component={isInternalLink ? RouterLink : undefined}
			href={isInternalLink ? undefined : href}
			ref={forwardedRef}
			rel={external ? "noopener noreferrer" : ""}
			target={external ? "_blank" : ""}
			to={isInternalLink ? href : undefined}

			{...props}>
			{children}
			{external && !noIcon &&
				// give warning if link is external
				// https://www.w3.org/TR/WCAG20-TECHS/G201.html
				<OpenInNew
					fontSize="inherit"
					color="inherit"
					titleAccess="Opens in new tab"
					sx={{
						height: "0.8em",
						marginLeft: "0.3em",
						opacity: 0.8,
						width: "0.8em",

						"&:hover": {
							opacity: 1,
						},
					}}
				/>}
		</Link>
	);
};

export default React.forwardRef((props, ref) => <TextLink {...props} forwardedRef={ref} />);
