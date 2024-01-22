import { Box, Typography } from '@mui/material';
import { FAQ } from '@/components/client';

/**
 * Shows a list of FAQs given a JSON object
 *
 * The JSON object should be structured like this:
 * - keys are the category names
 * - values are arrays of FAQs
 *
 * @param {{[category: string]: {question: string, answer: string}[]}} faq The FAQs
 */
export const FAQList = faq => {
	return Object.keys(faq).map((category, index) => {
		return (
			<Box
				sx={{
					mt: 2,
				}}
				key={index}
			>
				<Typography sx={{ marginBottom: 2 }} id={category} component="h3" variant="h6">
					{category}
				</Typography>

				{faq[category].map((faq, index) => {
					return <FAQ key={index} faq={faq} />;
				})}
			</Box>
		);
	});
};
