<script lang="ts">
	import CurrentLocation from '$lib';
	import { Map, NavigationControl, ScaleControl } from 'maplibre-gl';
	import { onMount } from 'svelte';

	let mapContainer: HTMLDivElement;
	let map: Map;

	onMount(async () => {
		map = new Map({
			container: mapContainer,
			style: 'https://undp-data.github.io/style/style.json',
			hash: true
		});

		map.addControl(new NavigationControl({}), 'top-right');
		map.addControl(new ScaleControl({}), 'bottom-left');
	});
</script>

<div class="map" bind:this={mapContainer} />
<CurrentLocation bind:map isHover={true} position="top-left" />

<style>
	@import 'maplibre-gl/dist/maplibre-gl.css';

	.map {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 100%;
		height: 100%;
		z-index: 1;
	}
</style>
