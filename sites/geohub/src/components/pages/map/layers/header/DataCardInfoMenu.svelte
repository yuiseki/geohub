<script lang="ts">
	import DataCardInfo from '$components/pages/map/data/DataCardInfo.svelte';
	import { initTippy } from '$lib/helper';
	import type { Layer } from '$lib/types';

	const tippy = initTippy();
	let tooltipContent: HTMLElement;

	export let layer: Layer = undefined;
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<a class="dropdown-item" role="button" tabindex="0" use:tippy={{ content: tooltipContent }}>
	<span class="icon-text">
		<span class="icon">
			<i class="fa-solid fa-circle-info"></i>
		</span>
		<span>Metadata</span>
	</span>
</a>

<div class="tooltip" data-testid="tooltip" bind:this={tooltipContent}>
	<button class="delete close"></button>

	<div class="data-card">
		<DataCardInfo bind:feature={layer.dataset} bind:metadata={layer.info} />
	</div>
</div>

<style lang="scss">
	@import 'tippy.js/dist/tippy.css';
	@import 'tippy.js/themes/light.css';

	.tooltip {
		width: 300px;
		inset: -10px auto auto 0px !important;

		.close {
			z-index: 10;
			position: absolute;
			top: 5px;
			right: 5px;
		}

		.data-card {
			text-align: justify;
			text-justify: inter-word;
			word-wrap: break-word;
			font-weight: lighter;
			max-height: 300px;
			overflow-y: auto;
			overflow-x: hidden;
		}
	}
</style>
