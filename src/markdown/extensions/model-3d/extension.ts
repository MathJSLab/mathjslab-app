import type { MarkdownDocumentContext, MarkdownExtension } from '../../../MarkdownEngine';
import { assertSourceSize, observeElementResize, renderExtensionError, resolveResourceUrl } from '../../extensionUtils';
import { model3DManifest } from './manifest';
import type { AnimationMixer, Object3D, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

type Entry = {
    scene: Scene;
    camera: PerspectiveCamera;
    renderer: WebGLRenderer;
    controls: OrbitControls;
    mixer?: AnimationMixer;
    frame: number | undefined;
    disconnect: () => void;
    disconnectVisibility: () => void;
    onChange: () => void;
};

const disposeObject = (object: Object3D): void => {
    object.traverse((child) => {
        const mesh = child as Object3D & {
            geometry?: { dispose(): void };
            material?: { dispose(): void; map?: { dispose(): void } } | Array<{ dispose(): void; map?: { dispose(): void } }>;
        };
        mesh.geometry?.dispose();
        const materials = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
        for (const material of materials) {
            material.map?.dispose();
            material.dispose();
        }
    });
};

export const model3DExtension = (): MarkdownExtension => {
    const entries = new Map<Element, Entry>();
    const dispose = (container: Element): void => {
        const entry = entries.get(container);
        if (entry) {
            if (entry.frame !== undefined) cancelAnimationFrame(entry.frame);
            entry.disconnect();
            entry.disconnectVisibility();
            entry.controls.removeEventListener('change', entry.onChange);
            entry.controls.dispose();
            disposeObject(entry.scene);
            entry.renderer.dispose();
            entry.renderer.forceContextLoss();
        }
        entries.delete(container);
        container.replaceChildren();
    };
    const render = async (container: Element, source: string, context: MarkdownDocumentContext): Promise<void> => {
        const language = container.getAttribute('data-markdown-language') ?? 'gltf';
        try {
            assertSourceSize(source, context);
            const [THREE, { OrbitControls }, { STLLoader }, { OBJLoader }, { GLTFLoader }] = await Promise.all([
                import(/* webpackChunkName: "markdown-model-3d" */ 'three'),
                import(/* webpackChunkName: "markdown-model-3d" */ 'three/examples/jsm/controls/OrbitControls.js'),
                import(/* webpackChunkName: "markdown-model-3d" */ 'three/examples/jsm/loaders/STLLoader.js'),
                import(/* webpackChunkName: "markdown-model-3d" */ 'three/examples/jsm/loaders/OBJLoader.js'),
                import(/* webpackChunkName: "markdown-model-3d" */ 'three/examples/jsm/loaders/GLTFLoader.js'),
            ]);
            if (context.signal?.aborted) return;
            dispose(container);
            const width = Math.max(context.width ?? container.clientWidth ?? 640, 1);
            const height = Math.max(context.height ?? container.clientHeight ?? 420, 1);
            const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
            renderer.setSize(width, height, false);
            renderer.domElement.setAttribute('role', 'application');
            renderer.domElement.setAttribute('aria-label', `Interactive ${language.toUpperCase()} model`);
            container.append(renderer.domElement);
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 10000);
            const controls = new OrbitControls(camera, renderer.domElement);
            scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 2.5));
            const directional = new THREE.DirectionalLight(0xffffff, 2);
            directional.position.set(3, 5, 4);
            scene.add(directional);
            let object: Object3D;
            let mixer: AnimationMixer | undefined;
            if (language === 'stl') {
                const geometry = new STLLoader().parse(new TextEncoder().encode(source).buffer);
                geometry.computeVertexNormals();
                object = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0x78909c, roughness: 0.65, metalness: 0.05 }));
            } else if (language === 'obj') {
                object = new OBJLoader().parse(source);
            } else {
                const base = context.sourceUrl ? new URL('.', context.sourceUrl).href : document.baseURI;
                const manager = new THREE.LoadingManager();
                manager.setURLModifier((url) => resolveResourceUrl(url, context).href);
                const gltf = await new GLTFLoader(manager).parseAsync(source, base);
                if (context.signal?.aborted) {
                    disposeObject(gltf.scene);
                    controls.dispose();
                    renderer.dispose();
                    renderer.forceContextLoss();
                    container.replaceChildren();
                    return;
                }
                object = gltf.scene;
                if (gltf.animations.length) {
                    mixer = new THREE.AnimationMixer(object);
                    gltf.animations.forEach((clip: import('three').AnimationClip) => mixer!.clipAction(clip).play());
                }
            }
            scene.add(object);
            const box = new THREE.Box3().setFromObject(object);
            const sphere = box.getBoundingSphere(new THREE.Sphere());
            const distance = Math.max(sphere.radius * 2.8, 1);
            camera.position.set(sphere.center.x + distance, sphere.center.y + distance * 0.65, sphere.center.z + distance);
            camera.near = Math.max(distance / 1000, 0.001);
            camera.far = distance * 100;
            camera.updateProjectionMatrix();
            controls.target.copy(sphere.center);
            controls.update();
            const clock = new THREE.Clock();
            const onChange = (): void => renderer.render(scene, camera);
            const entry: Entry = {
                scene,
                camera,
                renderer,
                controls,
                ...(mixer ? { mixer } : {}),
                frame: undefined,
                disconnect: () => undefined,
                disconnectVisibility: () => undefined,
                onChange,
            };
            let visible = true;
            const draw = (): void => {
                if (!visible || context.signal?.aborted) {
                    entry.frame = undefined;
                    return;
                }
                mixer?.update(clock.getDelta());
                renderer.render(scene, camera);
                if (mixer) entry.frame = requestAnimationFrame(draw);
            };
            controls.addEventListener('change', onChange);
            entry.disconnect = observeElementResize(container, context, (nextWidth, nextHeight) => {
                if (!nextWidth || !nextHeight) return;
                camera.aspect = nextWidth / nextHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(nextWidth, nextHeight, false);
                renderer.render(scene, camera);
            });
            if (typeof IntersectionObserver !== 'undefined' && mixer) {
                const observer = new IntersectionObserver(([observed]) => {
                    visible = observed?.isIntersecting ?? true;
                    if (!visible && entry.frame !== undefined) {
                        cancelAnimationFrame(entry.frame);
                        entry.frame = undefined;
                    } else if (visible && entry.frame === undefined) {
                        clock.getDelta();
                        draw();
                    }
                });
                observer.observe(container);
                entry.disconnectVisibility = () => observer.disconnect();
            }
            entries.set(container, entry);
            draw();
        } catch (error) {
            renderExtensionError(container, 'Three.js', language, source, error, context);
        }
    };
    return {
        name: model3DManifest.name,
        manifest: model3DManifest,
        fences: model3DManifest.fences.map((fence) => ({ ...fence, render, dispose })),
        dispose() {
            for (const container of Array.from(entries.keys())) dispose(container);
        },
    };
};
