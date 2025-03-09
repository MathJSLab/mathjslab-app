import PlotEngine from './PlotEngine';

const insertOutput = { type: '' };
const outputFunction: { [k: string]: Function } = {
    ...PlotEngine.outputFunction,
};
export { outputFunction, insertOutput };
export default outputFunction;
