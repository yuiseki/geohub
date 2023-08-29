import type { DatasetFeature } from './DatasetFeature';

export interface RawDataset {
	id: string;
	name: string;
	url: string;
	contentLength: number;
	createdat: string;
	updatedat: string;
	error?: string;
}
export interface IngestedDataset {
	id?: string;
	name?: string;
	url?: string;
	contentLength?: number;
	createdat?: string;
	updatedat?: string;
	processing?: boolean;
	processingFile?: string;
	feature?: DatasetFeature;
}

export interface IngestingDataset {
	raw: RawDataset;
	datasets?: IngestedDataset[];
}
