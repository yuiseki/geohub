<script lang="ts">
	import { enhance } from '$app/forms';
	import { afterNavigate, goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import AccessLevelSwitcher from '$components/util/AccessLevelSwitcher.svelte';
	import BackToPreviousPage from '$components/util/BackToPreviousPage.svelte';
	import CountryPicker from '$components/util/CountryPicker.svelte';
	import DataPreviewContent from '$components/util/DataPreviewContent.svelte';
	import DataProviderPicker from '$components/util/DataProviderPicker.svelte';
	import Notification from '$components/util/Notification.svelte';
	import SdgCard from '$components/util/SdgCard.svelte';
	import SdgPicker from '$components/util/SdgPicker.svelte';
	import Tags from '$components/util/Tags.svelte';
	import { TagInputValues } from '$lib/config/AppConfig';
	import type { Continent, Country, DatasetFeature, Region, Tag } from '$lib/types';
	import { DefaultLink } from '@undp-data/svelte-undp-design';
	import { toast } from '@zerodevx/svelte-toast';
	import Time from 'svelte-time';
	import { fade } from 'svelte/transition';
	import type { PageData } from './$types';

	export let data: PageData;

	// preserve previous page URL
	let previousPage: string = base;
	afterNavigate(({ from }) => {
		if (from?.url) {
			previousPage = `${from?.url.pathname}${from?.url.search}`;
		}
	});
	const REDIRECRT_TIME = 2000; // two second

	type Tab = 'general' | 'coverage' | 'tags' | 'preview';
	const hash: Tab = $page.url.hash?.replace('#', '') as Tab;

	const tabs: { id: Tab; label: string }[] = [
		{
			id: 'general',
			label: 'General'
		},
		{
			id: 'coverage',
			label: 'Coverage'
		},
		{
			id: 'tags',
			label: 'Tags'
		},
		{
			id: 'preview',
			label: 'Preview'
		}
	];
	let activeTab: Tab = hash && tabs.find((t) => t.id === hash) ? hash : 'general';

	let feature: DatasetFeature = data.feature;
	const isNew: boolean = data.isNew ?? true;
	let name = feature?.properties.name ?? '';
	let description = feature?.properties.description ?? '';
	let license = feature?.properties.license ?? '';
	let tags = '';
	let isRegistering = false;

	let selectedContinents: Continent[] = [];
	let continentsMaster: Continent[] = data.continents;
	let selectedRegions: Region[] = [];
	let regionsMaster: Region[] = data.regions;

	let isDialogOpen = false;

	const continentSelected = (c: Continent, isInit = false) => {
		if (selectedContinents.includes(c)) {
			const rs = selectedRegions.filter((r) => r.continent_code === c.continent_code);
			for (const r of rs) {
				regionSelected(r);
			}
			selectedContinents.splice(selectedContinents.indexOf(c), 1);
		} else {
			selectedContinents.push(c);
			if (!isInit) {
				regionsMaster
					.filter((r) => r.continent_code === c.continent_code)
					?.forEach((r) => {
						regionSelected(r);
					});
			}
		}
		selectedContinents = [...selectedContinents];
		if (selectedContinents.length === 0) {
			continents = [];
			selectedRegions = [];
		} else {
			continents = selectedContinents.map((c) => {
				return {
					key: 'continent',
					value: c.continent_name
				};
			});
		}
	};

	const regionSelected = (r: Region) => {
		if (selectedRegions.includes(r)) {
			selectedRegions.splice(selectedRegions.indexOf(r), 1);
		} else {
			if (!selectedRegions.find((c) => c.region_code === r.region_code)) {
				selectedRegions.push(r);
			}
		}
		selectedRegions = [...selectedRegions];
		if (selectedRegions.length === 0) {
			regions = [];
		} else {
			regions = selectedRegions.map((r) => {
				return {
					key: 'region',
					value: r.region_name
				};
			});
		}
	};

	const excludedTagForEditing = [
		'type',
		'container',
		'geometry_column',
		'geometrytype',
		'geometry_type',
		'id',
		'id_column',
		'layertype',
		'schema',
		'srid',
		'table'
	];

	const initTags = (
		key: 'provider' | 'sdg_goal' | 'continent' | 'region' | 'country' | 'other'
	) => {
		const _tags: Tag[] = feature?.properties?.tags;
		if (key === 'other') {
			const keys = [
				'provider',
				'sdg_goal',
				'country',
				'region',
				'continent',
				'extent',
				...excludedTagForEditing
			];
			return _tags?.filter((t) => !keys.includes(t.key)) ?? [];
		} else {
			let keys: string[] = [key];
			return _tags?.filter((t) => keys.includes(t.key)) ?? [];
		}
	};

	let providers: Tag[] = initTags('provider');
	let sdgs: Tag[] = initTags('sdg_goal');
	let continents: Tag[] = initTags('continent');
	let regions: Tag[] = initTags('region');
	let countries: Tag[] = initTags('country');
	let otherTags: Tag[] = initTags('other');

	let licenses = [
		'Creative Commons Zero 1.0 Universal',
		'Creative Commons BY 4.0',
		'Creative Commons BY ShareAlike 4.0',
		'Creative Commons BY NoDerivs 4.0',
		'Creative Commons BY NonCommercial 4.0',
		'Creative Commons BY NonCommercial ShareAlike 4.0',
		'Creative Commons BY NonCommercial NoDerivs 4.0',
		'GNU Free Documentation License',
		'License not specified',
		'Open Data Commons Attribution License',
		'Open Data Commons Open Database License (ODbL)',
		'Open Data Commons Public Domain Dedication and License (PDDL)',
		'Other (Attribution)',
		'Other (Non-Commercial)',
		'Other (Not Open)',
		'Other (Open)',
		'Other (Public Domain)',
		'UK Open Governement License (OGL)'
	];

	$: sdgs, updateTags();
	$: continents, updateTags();
	$: regions, updateTags();
	$: countries, updateTags();
	$: otherTags, updateTags();
	$: providers, updateTags();

	let extentTag = feature.properties?.tags?.find(
		(t) => t.key === 'extent' && t.value.toLowerCase() === 'global'
	);

	let isGlobal: 'global' | 'regional' = !data.isNew
		? extentTag
			? 'global'
			: 'regional'
		: undefined;

	const updateTags = () => {
		const excludes = [
			'provider',
			'sdg_goal',
			'country',
			'region',
			'continent',
			...TagInputValues.map((t) => t.key)
		];
		const originalTags = feature?.properties?.tags?.filter((t) => !excludes.includes(t.key));

		let joined = sdgs.concat(
			providers,
			continents,
			regions,
			countries,
			otherTags.filter((t) => t.value.length > 0),
			originalTags
		);
		if (isGlobal === 'global') {
			if (!joined?.find((t) => t.key === 'extent' && t.value === 'Global')) {
				joined = [
					...joined,
					{
						key: 'extent',
						value: 'Global'
					}
				];
			}
		} else {
			const index = joined.findIndex((t) => {
				return t.key === 'extent' && t.value === 'Global';
			});
			if (index > -1) {
				joined.splice(index, 1);
			}
		}
		tags = JSON.stringify(joined);
	};

	const handleGlobalRegionalChanged = (type: 'global' | 'regional') => {
		isGlobal = type;
		if (isGlobal === 'global') {
			selectedContinents = [];
			selectedRegions = [];
			continents = [];
			regions = [];
			countries = [];
		}
	};

	const handleCountrySelected = (e) => {
		const _countries: Country[] = e.detail.countries;
		if (_countries.length === 0) {
			countries = [];
			return;
		}

		_countries.forEach((c) => {
			const ct = continentsMaster.find((a) => a.continent_code === c.continent_code);
			const re = regionsMaster.find((a) => a.region_code === c.region_code);
			if (!selectedContinents.includes(ct)) {
				selectedContinents.push(ct);
			}
			if (!selectedRegions.includes(re)) {
				selectedRegions.push(re);
			}
		});
		selectedContinents = [...selectedContinents];
		selectedRegions = [...selectedRegions];

		selectedContinents?.forEach((c) => {
			if (continents.find((x) => x.value === c.continent_name)) return;
			continents.push({ key: 'continent', value: c.continent_name });
		});
		continents = [...continents];

		selectedRegions?.forEach((c) => {
			if (regions.find((x) => x.value === c.region_name)) return;
			regions.push({ key: 'region', value: c.region_name });
		});
		regions = [...regions];

		const temp: Tag[] = [];
		_countries.forEach((c) => {
			if (temp.find((x) => x.value === c.country_name)) return;
			temp.push({ key: 'country', value: c.iso_3 });
		});
		countries = temp;
	};

	feature.properties.tags
		.filter((t) => t.key === 'continent')
		?.forEach((f) => {
			let continent = continentsMaster.find((c) => c.continent_name === f.value);
			continentSelected(continent, true);
		});
	feature.properties.tags
		.filter((t) => t.key === 'region')
		?.forEach((f) => {
			let region = regionsMaster.find((c) => c.region_name === f.value);
			regionSelected(region);
		});

	const redirectToPreviousPage = () => {
		if (previousPage) {
			goto(previousPage, {
				replaceState: true
			});
		} else {
			goto('/data#mydata');
		}
	};
</script>

<div class="m-4 py-5">
	<h1 class="title is-1">{isNew ? 'Publish' : 'Update'} metadata of the dataset</h1>

	<div class="my-2"><BackToPreviousPage defaultLink="/data#mydata" /></div>

	<form
		method="POST"
		action="?/publish"
		use:enhance={({ cancel }) => {
			if (isRegistering) {
				cancel();
			}
			isRegistering = true;

			return async ({ result }) => {
				if (result.status === 200) {
					feature = result.data;
					if (isNew) {
						isDialogOpen = true;
					} else {
						toast.push(
							'Dataset was registered successfully. It is going back to the previous page.',
							{
								duration: REDIRECRT_TIME
							}
						);
						setTimeout(() => {
							redirectToPreviousPage();
						}, REDIRECRT_TIME);
					}
				} else {
					toast.push(result.data);
				}
				isRegistering = false;
			};
		}}
	>
		{#if !data.isNew}
			<div class="pb-4">
				<p>
					This dataset was initially created by <b>{feature.properties.updated_user}</b> at
					<b>
						<Time timestamp={feature.properties.createdat} format="h:mm A, MMMM D, YYYY" />
					</b>
				</p>
				<p>
					This dataset was lastly updated by <b>{feature.properties.updated_user}</b> at
					<b>
						<Time timestamp={feature.properties.updatedat} format="h:mm A, MMMM D, YYYY" />
					</b>
				</p>
			</div>
		{/if}

		<div class="field is-grouped py-2">
			<div class="control">
				<button
					class="button is-primary {isRegistering ? 'is-loading' : ''}"
					disabled={!(
						name &&
						license &&
						description &&
						providers.length > 0 &&
						(isGlobal === 'global' ||
							(isGlobal === 'regional' &&
								(selectedContinents.length > 0 ||
									selectedRegions.length > 0 ||
									countries.length > 0)))
					)}
					type="submit"
				>
					<span class="icon">
						<i class="fa-solid fa-cloud-arrow-up" />
					</span>
					<span> {isNew ? 'Publish' : 'Update'}</span>
				</button>
			</div>
		</div>

		<div class="tabs">
			<ul>
				{#each tabs as tab}
					{@const isGeneralInfoFilled = name && license && description && providers.length > 0}
					{@const isCoverageFilled =
						isGlobal === 'global' ||
						(isGlobal === 'regional' &&
							(selectedContinents.length > 0 ||
								selectedRegions.length > 0 ||
								countries.length > 0))}
					{@const isTagsFilled = sdgs.length > 0 || otherTags.length > 0}
					<li class={activeTab === tab.id ? 'is-active is-primary' : ''}>
						<a
							href="#{tab.id}"
							on:click={() => {
								activeTab = tab.id;
							}}
						>
							{tab.label}
							{#if tab.id === 'general'}
								{#if isGeneralInfoFilled}
									<span class="icon has-text-success">
										<span class="fa-stack fa-2xs">
											<i class="fa-solid fa-circle fa-stack-2x"></i>
											<i class="fa-solid fa-check fa-stack-1x fa-inverse"></i>
										</span>
									</span>
								{/if}
							{:else if tab.id === 'coverage'}
								{#if isCoverageFilled}
									<span class="icon has-text-success">
										<span class="fa-stack fa-2xs">
											<i class="fa-solid fa-circle fa-stack-2x"></i>
											<i class="fa-solid fa-check fa-stack-1x fa-inverse"></i>
										</span>
									</span>
								{/if}
							{:else if tab.id === 'tags'}
								{#if isTagsFilled}
									<span class="icon has-text-success">
										<span class="fa-stack fa-2xs">
											<i class="fa-solid fa-circle fa-stack-2x"></i>
											<i class="fa-solid fa-check fa-stack-1x fa-inverse"></i>
										</span>
									</span>
								{/if}
							{/if}
						</a>
					</li>
				{/each}
			</ul>
		</div>

		<!-- General tab -->
		<div hidden={activeTab !== 'general'}>
			<div class="field">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">Dataset name</label>
				<div class="control has-icons-right">
					<input
						class="input {name.length > 0 ? 'is-success' : 'is-danger'}"
						type="text"
						name="name"
						placeholder="Type name of dataset"
						disabled={isRegistering}
						bind:value={name}
					/>
					{#if name}
						<span class="icon is-small is-right">
							<i class="fas fa-check has-text-success" />
						</span>
					{/if}
				</div>
				<p class="help is-dark">Name the dataset shortly and precisely.</p>
			</div>

			<div class="field">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">Description</label>
				<div class="control has-icons-right">
					<textarea
						class="textarea {description.length > 0 ? 'is-success' : 'is-danger'} description"
						name="description"
						placeholder="Type description of dataset"
						disabled={isRegistering}
						bind:value={description}
					/>
					{#if description}
						<span class="icon is-small is-right">
							<i class="fas fa-check has-text-success" />
						</span>
					{/if}
				</div>
				<p class="help is-dark">
					Describe the dataset briefly. This information will be shown in data catalog.
				</p>
			</div>

			<div class="field">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">License</label>
				<div class="control has-icons-right">
					<div class="select is-fullwidth {license.length > 0 ? 'is-success' : 'is-danger'}">
						<select bind:value={license} disabled={isRegistering} name="license">
							<option value="">Select a data license</option>
							{#each licenses as lc}
								<option value={lc}>{lc}</option>
							{/each}
						</select>
					</div>
					{#if license}
						<span class="icon is-small is-right">
							<i class="fas fa-check has-text-success" />
						</span>
					{/if}
				</div>
				<p class="help is-dark">
					Open data license definition can be found at
					<DefaultLink href="https://opendefinition.org/licenses/" target="_blank" title="here" />
				</p>
			</div>

			<div class="field">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">Data providers</label>
				<div class="control">
					<DataProviderPicker bind:tags={providers} />
				</div>
				<p class="help is-dark">Select at least a data provider for the dataset.</p>
			</div>

			<div class="field">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">Please select data accessibility.</label>
				<div class="control">
					<AccessLevelSwitcher bind:accessLevel={feature.properties.access_level} />
				</div>
				<p class="help is-dark">
					If you are ready to publish as open data, select <b>Public</b>. If you selected your
					organisation or your name, the data can only be accessed by authenticated users.
				</p>
			</div>
		</div>

		<!-- coverage tab -->
		<div hidden={activeTab !== 'coverage'}>
			<div class="field">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">Is your data global or regional?</label>
				<div class="control">
					<div class="field has-addons">
						<p class="control">
							<button
								type="button"
								class="button {isGlobal === 'global'
									? 'is-primary is-active'
									: 'is-primary is-light'}"
								on:click={() => handleGlobalRegionalChanged('global')}
							>
								<span class="icon is-small">
									<i class="fas fa-globe" />
								</span>
								<span>Global</span>
							</button>
						</p>
						<p class="control">
							<button
								type="button"
								class="button {isGlobal === 'regional'
									? 'is-primary is-active'
									: 'is-primary is-light'}"
								on:click={() => handleGlobalRegionalChanged('regional')}
							>
								<span class="icon is-small">
									<i class="fas fa-earth-africa" />
								</span>
								<span>Regional</span>
							</button>
						</p>
					</div>
				</div>
			</div>

			{#if isGlobal === 'regional'}
				<div class="field">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label">Please select a continent for your data.</label>
					<div class="control">
						<div class="field has-addons is-flex is-flex-wrap-wrap">
							{#each continentsMaster as continent}
								<p class="control pt-1">
									<button
										type="button"
										class="button {selectedContinents.find(
											(c) => c.continent_code === continent.continent_code
										)
											? 'is-primary is-active'
											: 'is-primary is-light'}"
										on:click={() => {
											continentSelected(continent);
										}}
									>
										<span class="icon is-small">
											<i
												class="fa-solid {continent.continent_name === 'Antarctica'
													? 'fa-globe'
													: `fa-earth-${continent.continent_name.toLowerCase()}`}"
											/>
										</span>
										<span>{continent.continent_name}</span>
									</button>
								</p>
							{/each}
						</div>
					</div>
				</div>

				{#if isGlobal === 'regional' && selectedContinents.length > 0}
					<div class="field">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label class="label">Please select a region for your data.</label>
						<div class="control">
							<div class="field has-addons is-flex is-flex-wrap-wrap">
								{#each regionsMaster as region}
									{#if selectedContinents.filter((c) => c.continent_code === region.continent_code).length > 0}
										<p class="control pt-1">
											<button
												type="button"
												class="button {regions.find((r) => r.value === region.region_name)
													? 'is-primary is-active'
													: 'is-primary is-light'}"
												on:click={() => regionSelected(region)}
											>
												<span>{region.region_name}</span>
											</button>
										</p>
									{/if}
								{/each}
							</div>
						</div>
					</div>
				{/if}
				<div class="field">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label">Please select countries</label>
					<div class="control">
						<CountryPicker
							on:change={handleCountrySelected}
							bind:tags={countries}
							bind:selectedContinents
							bind:selectedRegions
							showSelectedCountries={true}
						/>
					</div>
				</div>
			{/if}
		</div>

		<!-- Tags tab -->
		<div hidden={activeTab !== 'tags'}>
			<div class="field">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">SDGs (Optional)</label>
				<div class="control">
					<SdgPicker bind:tags={sdgs} />

					<div class="mt-2 is-flex is-flex-direction-row is-flex-wrap-wrap">
						{#each sdgs as sdg}
							<SdgCard sdg={Number(sdg.value)} isSelectable={false} />
						{/each}
					</div>
				</div>
				<p class="help is-dark">
					Select relevant SDG goals which the dataset is related to. Learn more about SDGs by
					<DefaultLink
						href="https://www.undp.org/sustainable-development-goals"
						target="_blank"
						title="clicking here"
					/>
				</p>
			</div>

			<div class="field">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">Tags (Optional)</label>
				<div class="control">
					<Tags bind:tags={otherTags} />
				</div>
				<p class="help is-dark">
					Select relevant tags which the dataset is related to. These tags will be helpful for users
					to search data.
				</p>
			</div>
		</div>

		<!-- Preview tab -->
		<div hidden={activeTab !== 'preview'}>
			<DataPreviewContent
				bind:feature
				bind:url={feature.properties.url}
				isLoadMap={true}
				width="100%"
			/>
		</div>

		<input class="input" type="hidden" name="feature" value={JSON.stringify(feature)} />

		<input class="input" type="hidden" name="tags" bind:value={tags} />
	</form>
</div>

<div class="modal {isDialogOpen ? 'is-active' : ''}" data-testid="modal-dialog" transition:fade>
	<div class="modal-background" />
	<div class="modal-card">
		<header class="modal-card-head">
			<span class="modal-card-title">Successfully published!</span>
		</header>
		<section class="modal-card-body">
			<Notification type="info" showCloseButton={false}>
				One more thing you can do about the dataset appearance.
			</Notification>
			<br />
			If you would like to continue editing how the dataset will be appeared in a map as default, please
			click <b>Set default appearance</b>.

			<br />
			Click <b>Go back to Data</b> if you would like to do configuration afterwards. You can
			configure the dataset apperance from the dropdown menu of <b>Set default layer style</b>.
		</section>
		<footer class="modal-card-foot is-flex is-flex-direction-row is-justify-content-flex-end">
			<button class="button is-link" on:click={redirectToPreviousPage}> Go back to Data </button>
			<a class="button is-primary" href="/data/{feature.properties.id}/style/edit">
				Set default appearance
			</a>
		</footer>
	</div>
</div>

<style lang="scss">
	.description {
		resize: none;
		height: 100px;
	}
</style>
