<script lang="ts">
	import ClassificationMethodSelect from '$components/maplibre/ClassificationMethodSelect.svelte';
	import OpacitySlider from '$components/maplibre/OpacitySlider.svelte';
	import OptionalPropertyEditor from '$components/maplibre/OptionalPropertyEditor.svelte';
	import CircleStrokeColor from '$components/maplibre/circle/CircleStrokeColor.svelte';
	import CircleStrokeWidth from '$components/maplibre/circle/CircleStrokeWidth.svelte';
	import FillExtrusionBase from '$components/maplibre/fill-extrusion/FillExtrusionBase.svelte';
	import FillExtrusionHeight from '$components/maplibre/fill-extrusion/FillExtrusionHeight.svelte';
	import FillExtrusionVerticalGradient from '$components/maplibre/fill-extrusion/FillExtrusionVerticalGradient.svelte';
	import FillOutlineColor from '$components/maplibre/fill/FillOutlineColor.svelte';
	import HeatmapIntensity from '$components/maplibre/heatmap/HeatmapIntensity.svelte';
	import HeatmapRadius from '$components/maplibre/heatmap/HeatmapRadius.svelte';
	import HeatmapWeight from '$components/maplibre/heatmap/HeatmapWeight.svelte';
	import LinePattern from '$components/maplibre/line/LinePattern.svelte';
	import IconOverlap from '$components/maplibre/symbol/IconOverlap.svelte';
	import FieldControl from '$components/util/FieldControl.svelte';
	import type { VectorLayerSpecification, VectorTileMetadata } from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import { Accordion } from '@undp-data/svelte-undp-design';
	import chroma from 'chroma-js';
	import type { LayerSpecification } from 'maplibre-gl';
	import { getContext } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;
	export let metadata: VectorTileMetadata;
	export let defaultColor: string;

	let defaultFillOutlineColor: string = defaultColor ? chroma(defaultColor).darken(2.5).hex() : '';

	const style: VectorLayerSpecification = $map
		.getStyle()
		.layers.find((l: LayerSpecification) => l.id === layerId) as VectorLayerSpecification;

	let isDataMenuAvailable = ['circle', 'fill-extrusion', 'fill', 'symbol', 'line'].includes(
		style.type
	);

	let expanded: { [key: string]: boolean } = {
		Data: isDataMenuAvailable,
		Appearance: !isDataMenuAvailable
	};
	// to allow only an accordion to be expanded
	let expandedDatasetId: string;
	$: {
		let expandedDatasets = Object.keys(expanded).filter(
			(key) => expanded[key] === true && key !== expandedDatasetId
		);
		if (expandedDatasets.length > 0) {
			expandedDatasetId = expandedDatasets[0];
			Object.keys(expanded)
				.filter((key) => key !== expandedDatasetId)
				.forEach((key) => {
					expanded[key] = false;
				});
			expanded[expandedDatasets[0]] = true;
		}
	}
</script>

<OptionalPropertyEditor>
	{#if isDataMenuAvailable}
		<Accordion headerTitle="Data related" fontSize="medium" bind:isExpanded={expanded['Data']}>
			<div class="pb-2" slot="content">
				<p class="py-2">
					You can adjust data related parameters. These parameters operate on the data itself.
				</p>

				<FieldControl title="Classification method">
					<div slot="help">
						Whether to apply a classification method for a vector layer in selected property. This
						setting is only used when you select a property to classify the layer appearance.
					</div>
					<div slot="control"><ClassificationMethodSelect /></div>
				</FieldControl>
			</div>
		</Accordion>
	{/if}

	<Accordion headerTitle="Appearance" fontSize="medium" bind:isExpanded={expanded['Appearance']}>
		<div class="pb-2" slot="content">
			<p class="py-2">
				You can adjust data visulasization parameters. These parameters do not alter underlying the
				data source.
			</p>

			<FieldControl title="Opacity">
				<div slot="help">The opacity at which the image will be drawn.</div>
				<div slot="control"><OpacitySlider bind:layerId /></div>
			</FieldControl>

			{#if style.type === 'symbol'}
				<FieldControl title="Overlap Priority">
					<div slot="help">
						Allows for control over whether to show an icon when it overlaps other symbols on the
						map.
						<br />
						<b>never</b>: The icon will be hidden if it collides with any other previously drawn
						symbol.
						<br />
						<b>always</b>: The icon will be visible even if it collides with any other previously
						drawn symbol.
						<br />
						<b>cooperative</b>: If the icon collides with another previously drawn symbol, the
						overlap mode for that symbol is checked. If the previous symbol was placed using never
						overlap mode, the new icon is hidden. If the previous symbol was placed using always or
						cooperative overlap mode, the new icon is visible.
					</div>
					<div slot="control"><IconOverlap {layerId} /></div>
				</FieldControl>
			{:else if style.type === 'line'}
				<FieldControl title="Line Pattern">
					<div slot="help">Line pattern for drawing.</div>
					<div slot="control"><LinePattern {layerId} bind:defaultColor /></div>
				</FieldControl>
			{:else if style.type === 'fill'}
				<FieldControl title="Fill outline color">
					<div slot="help">Change polygon outline color.</div>
					<div slot="control">
						<FillOutlineColor {layerId} bind:defaultColor={defaultFillOutlineColor} />
					</div>
				</FieldControl>
			{:else if style.type === 'heatmap'}
				<FieldControl title="Heatmap Intensity">
					<div slot="help">
						Similar to heatmap weight but controls the intensity of the heatmap globally. Primarily
						used for adjusting the heatmap based on zoom level.
					</div>
					<div slot="control"><HeatmapIntensity {layerId} /></div>
				</FieldControl>

				<FieldControl title="Heatmap Radius">
					<div slot="help">
						Radius of influence of one heatmap point in pixels. Increasing the value makes the
						heatmap smoother, but less detailed.
					</div>
					<div slot="control"><HeatmapRadius {layerId} /></div>
				</FieldControl>

				<FieldControl title="Heatmap Weight">
					<div slot="help">
						A measure of how much an individual point contributes to the heatmap. A value of 10
						would be equivalent to having 10 points of weight 1 in the same spot. Especially useful
						when combined with clustering.
					</div>
					<div slot="control"><HeatmapWeight {layerId} /></div>
				</FieldControl>
			{:else if style.type === 'circle'}
				<FieldControl title="Circle stroke color">
					<div slot="help">The stroke color of the circle.</div>
					<div slot="control"><CircleStrokeColor {layerId} /></div>
				</FieldControl>
				<FieldControl title="Circle stroke width">
					<div slot="help">
						The width of the circle's stroke. Strokes are placed outside of the circle radius.
					</div>
					<div slot="control"><CircleStrokeWidth {layerId} /></div>
				</FieldControl>
			{:else if style.type === 'fill-extrusion'}
				<FieldControl title="The height of the feature">
					<div slot="help">The height with which to extrude this layer.</div>
					<div slot="control">
						<FillExtrusionHeight {layerId} {metadata} />
					</div>
				</FieldControl>
				<FieldControl title="The base height of the layer">
					<div slot="help">
						The height with which to extrude the base of this layer. Must be less than or equal to
						the height
					</div>
					<div slot="control"><FillExtrusionBase {layerId} /></div>
				</FieldControl>

				<FieldControl title="Vertical gradient to the sides">
					<div slot="help">
						Whether to apply a vertical gradient to the sides of a 3D polygon layer. If true, sides
						will be shaded slightly darker farther down.
					</div>
					<div slot="control"><FillExtrusionVerticalGradient {layerId} /></div>
				</FieldControl>
			{/if}
		</div>
	</Accordion>
</OptionalPropertyEditor>
