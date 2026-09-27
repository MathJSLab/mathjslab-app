import type { MarkdownDocumentContext, MarkdownExtension } from '../../../MarkdownEngine';
import { assertSourceSize, observeElementResize, renderExtensionError } from '../../extensionUtils';
import { mapsManifest } from './manifest';
import type { GeoJsonObject } from 'geojson';
import type { Topology, Objects } from 'topojson-specification';

type MapEntry = { map: import('leaflet').Map; disconnect: () => void };

const popup = (feature: GeoJSON.Feature, layer: import('leaflet').Layer): void => {
    const properties = feature.properties;
    if (!properties) return;
    const label = properties.name ?? properties.title ?? properties.label;
    if (typeof label !== 'string' && typeof label !== 'number') return;
    const node = document.createElement('div');
    node.textContent = String(label);
    (layer as import('leaflet').Layer & { bindPopup(content: HTMLElement): unknown }).bindPopup(node);
};

export const mapsExtension = (): MarkdownExtension => {
    const maps = new Map<Element, MapEntry>();
    const dispose = (container: Element): void => {
        const entry = maps.get(container);
        entry?.disconnect();
        entry?.map.remove();
        maps.delete(container);
        container.replaceChildren();
    };
    const render = async (container: Element, source: string, context: MarkdownDocumentContext): Promise<void> => {
        const language = container.getAttribute('data-markdown-language') ?? 'geojson';
        try {
            assertSourceSize(source, context);
            const input = JSON.parse(source) as GeoJsonObject | Topology<Objects<GeoJSON.GeoJsonProperties>>;
            const [{ default: L }, topojson, { default: leafletStyles }] = await Promise.all([
                import(/* webpackChunkName: "markdown-maps" */ 'leaflet'),
                import(/* webpackChunkName: "markdown-maps" */ 'topojson-client'),
                import(/* webpackChunkName: "markdown-maps" */ 'leaflet/dist/leaflet.css?inline'),
            ]);
            if (context.signal?.aborted) return;
            dispose(container);
            const style = document.createElement('style');
            style.textContent = leafletStyles;
            const viewport = document.createElement('div');
            viewport.className = 'leaflet-container';
            viewport.setAttribute('role', 'application');
            viewport.setAttribute('aria-label', language === 'topojson' ? 'TopoJSON map' : 'GeoJSON map');
            container.append(style, viewport);
            const map = L.map(viewport, { zoomControl: true, attributionControl: true });
            context.createMapBaseLayer?.(L, context)?.addTo(map);
            const objects = language === 'topojson' ? Object.values((input as Topology).objects).map((object) => topojson.feature(input as Topology, object)) : [input as GeoJsonObject];
            const group = L.featureGroup(objects.map((object) => L.geoJSON(object, { onEachFeature: popup })));
            group.addTo(map);
            const bounds = group.getBounds();
            if (bounds.isValid()) map.fitBounds(bounds, { padding: [16, 16] });
            else map.setView([0, 0], 1);
            const disconnect = observeElementResize(container, context, () => map.invalidateSize({ pan: false }));
            maps.set(container, { map, disconnect });
        } catch (error) {
            renderExtensionError(container, 'Map', language, source, error, context);
        }
    };
    return {
        name: mapsManifest.name,
        manifest: mapsManifest,
        fences: mapsManifest.fences.map((fence) => ({ ...fence, render, dispose })),
        dispose() {
            for (const container of Array.from(maps.keys())) dispose(container);
        },
    };
};
