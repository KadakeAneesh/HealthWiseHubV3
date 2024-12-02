/**
 * PageContent Component
 * Provides responsive layout structure for page content
 * Handles main content and sidebar arrangement
 */
import { Flex } from '@chakra-ui/react';
import React from 'react';

type PageContentProps = {
	children: React.ReactNode;
};

const PageContent: React.FC<PageContentProps> = ({ children }) => {
	return (
		<Flex
			justify="center"
			p="16px 0px" //container for the whole page
		>
			<Flex
				width="95%"
				justify="center"
				maxWidth="860px" //container for LHS and RHS
			>
				<Flex
					direction="column"
					width={{ base: '100%', md: '65%' }}
					mr={{ base: 0, md: 6 }} //LHS
				>
					{children && children[0 as keyof typeof children]}
				</Flex>

				<Flex
					direction="column"
					display={{ base: 'none', md: 'flex' }}
					flexGrow={1} //RHS
				>
					{children && children[1 as keyof typeof children]}
				</Flex>
			</Flex>
		</Flex>
	);
};
export default PageContent;
