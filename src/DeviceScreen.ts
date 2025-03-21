/* CSS constants. */
import constants from './styles/constants.json';
/**
 * # DeviceScreen class.
 */
abstract class DeviceScreen {
    public static innerHeight: number;
    public static innerWidth: number;
    public static isPortrait: boolean;
    public static isTouchCapable: boolean;
    public static widthMedium: number;
    public static widthSmall: number;
    /**
     * Initializes DeviceScreen object (add `'resize'` event listener).
     */
    public static initialize(onScreenChange?: (event?: Event) => void): void {
        DeviceScreen.widthSmall = parseInt(constants['screen-width-small'].match(/([0-9]+(?:\.[0-9]*)?|[0-9]*\.[0-9]+)px/)![1], 10);
        DeviceScreen.widthMedium = parseInt(constants['screen-width-medium'].match(/([0-9]+(?:\.[0-9]*)?|[0-9]*\.[0-9]+)px/)![1], 10);
        DeviceScreen.isTouchCapable =
            'ontouchstart' in window ||
            (navigator.maxTouchPoints || (navigator as Navigator & { msMaxTouchPoints: number }).msMaxTouchPoints || 0) > 0;
        DeviceScreen.innerWidth = window.innerWidth;
        DeviceScreen.innerHeight = window.innerHeight;
        DeviceScreen.isPortrait = window.matchMedia('(orientation: portrait)').matches;
        if (onScreenChange) {
            DeviceScreen.onScreenChange = onScreenChange;
        }
        window.addEventListener('resize', DeviceScreen.updateScreen);
    }
    /**
     * Finalizes DeviceScreen object (remove `'resize'` event listener).
     */
    public static finalize(): void {
        window.removeEventListener('resize', DeviceScreen.updateScreen);
    }
    /**
     * Handler called when `DeviceScreen` properties has been changed.
     */
    public static onScreenChange?: (event?: Event) => void;
    /**
     * To be called on `'resize'` events, to update DeviceScreen properties.
     * @param event
     */
    private static updateScreen(event?: Event): void {
        const isPortrait = window.matchMedia('(orientation: portrait)').matches;
        if (
            DeviceScreen.innerWidth !== window.innerWidth ||
            DeviceScreen.innerHeight !== window.innerHeight ||
            DeviceScreen.isPortrait !== isPortrait
        ) {
            DeviceScreen.innerWidth = window.innerWidth;
            DeviceScreen.innerHeight = window.innerHeight;
            DeviceScreen.isPortrait = isPortrait;
            if (DeviceScreen.onScreenChange) {
                DeviceScreen.onScreenChange(event);
            }
        }
    }
}
/* Calls initialization for `DeviceScreen` object. */
DeviceScreen.initialize();
/* Store `DeviceScreen` object in the global object. */
(globalThis as any).DeviceScreen = DeviceScreen;
/* Exports. */
export { DeviceScreen };
/* Default export. */
export default { DeviceScreen };
