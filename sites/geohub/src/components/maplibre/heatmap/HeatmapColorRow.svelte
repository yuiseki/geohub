<script lang="ts">
	import ColorPicker from '$components/util/ColorPicker.svelte';
	import { initTippy } from '$lib/helper';
	import type { Color, HeatmapColorRow } from '$lib/types';
	import chroma from 'chroma-js';
	import { debounce } from 'lodash-es';
	import { createEventDispatcher, onMount } from 'svelte';

	const tippy = initTippy();
	let tooltipContent: HTMLElement;

	export let colorRow: HeatmapColorRow;

	const dispatch = createEventDispatcher();

	let color: Color;
	let colorPickerStyle: string;

	$: color, updateColorMap(color);
	$: colorPickerStyle = getColorPickerStyle(colorRow?.color);

	onMount(() => {
		setColorFromProp();
	});

	// set color based on default value
	const setColorFromProp = () => {
		const rowColor: Color = colorRow.color;
		const r = rowColor.r;
		const g = rowColor.g;
		const b = rowColor.b;

		color = {
			r,
			g,
			b,
			a: rowColor.a,
			hex: chroma([r, g, b]).hex('rgba'),
			h: chroma([r, g, b]).hsv()[0],
			s: chroma([r, g, b]).hsv()[1],
			v: chroma([r, g, b]).hsv()[2]
		};
	};

	// set color of display and dispatch to update map
	const updateColorMap = debounce((colorSelected: Color) => {
		if (colorSelected) {
			try {
				const rgba: number[] = chroma([colorSelected.r, colorSelected.g, colorSelected.b]).rgba();
				colorRow.color.r = rgba[0];
				colorRow.color.g = rgba[1];
				colorRow.color.b = rgba[2];
				colorRow.color.a = rgba[3] * 255;
				colorPickerStyle = getColorPickerStyle(colorRow.color);
				dispatch('changeColorMap');
			} catch (e) {
				console.log(e);
			}
		}
	}, 50);

	const getColorPickerStyle = (color: Color) => {
		const rgb = [color.r, color.g, color.b].join();
		return `caret-color:rgb(${rgb}); background-color: rgb(${rgb})`;
	};
</script>

<div
	class="color-editor is-mobile is-flex is-flex-direction-column"
	data-testid="heatmap-color-map-row-container"
>
	<div class="color-picker">
		<div
			title="Color Map Control"
			use:tippy={{ content: tooltipContent }}
			class="discrete"
			style="{colorPickerStyle}; width:100%; height:24px"
		/>
		<div class="tooltip" data-testid="tooltip" bind:this={tooltipContent}>
			<ColorPicker bind:color />
		</div>
	</div>

	<p class="is-size-6 has-text-centered">{colorRow?.value}</p>
</div>

<style lang="scss">
	@import 'tippy.js/dist/tippy.css';
	@import 'tippy.js/themes/light.css';

	.color-editor {
		.discrete {
			cursor: pointer;
			height: 20px;
			padding: 1px;
			width: 20px;

			&:hover {
				padding: 0;
				border: 1px solid hsl(204, 86%, 53%);
			}
		}
	}

	.tooltip {
		z-index: 10;
		padding: 0;
		height: 255px;
		width: 260px;
	}
</style>
