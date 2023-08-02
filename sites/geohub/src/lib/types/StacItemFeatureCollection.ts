import type { StacItemFeature } from './StacItemFeature';
import type { StacLink } from './StacLink';

export interface StacItemFeatureCollection {
	type: 'FeatureCollection';
	features: StacItemFeature[];
	links: StacLink[];
	totalCount: number;
}
