import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data }) => {
	const { collection, stacType } = data;
	const title = `${collection.title} | STAC management | GeoHub`;
	const content = collection.title;

	return {
		title,
		content,
		stacType,
		collection
	};
};
