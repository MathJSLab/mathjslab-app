declare module '*.styles.scss' {
    export const styles: string;
    export default styles;
}

declare module '*.module.scss' {
    const styles: { [className: string]: string };
    export default styles;
}
