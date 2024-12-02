/**
 * Layout Component
 * Main application layout wrapper providing consistent structure
 * Handles navigation and common UI elements across pages
 */
import React from 'react';
import Navbar from '../Navbar/Navbar';

interface LayoutProps {
	children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
	return (
		<>
			<Navbar />
			{/* <Navbar/>*/}
			<main>{children}</main>
		</>
	);
};
export default Layout;
