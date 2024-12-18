import bannerImage from '~/assets/notgpl/project_banner.jpg';
import { FAQList, ProjectList } from '~/components/client';
import { ExpiryContainer, Link } from '~/components/server';
import { HeroLayout } from '~/layouts/HeroLayout';
import { Alert } from '@mui/material';
import FAQData from './faq.json';

export const metadata = {
	title: 'Community Projects',
};

const ProjectPage = () => {
	return (
		<HeroLayout title={metadata.title} picture={bannerImage} position="bottom" id="projects">
			<ExpiryContainer date={'2023-08-20'}>
				<Alert variant="info">
					Community projects are back for Fall 2023! If you are a UTM CS Major/Spec,{' '}
					<Link external href="https://forms.gle/wgXtZQ9U36dn7BAZ9">
						reach out and apply
					</Link>
				</Alert>
			</ExpiryContainer>

			<h2 id="faq">Frequently Asked Questions</h2>
			<FAQList {...FAQData} />

			<ProjectList />
		</HeroLayout>
	);
};

export default ProjectPage;
