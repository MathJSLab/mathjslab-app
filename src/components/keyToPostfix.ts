const keyToPostfix = (keyField: string[]) => keyField.map((field) => field.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase());
export { keyToPostfix };
export default keyToPostfix;
