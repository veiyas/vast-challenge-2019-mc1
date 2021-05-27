import { scaleSequential } from 'd3-scale';
import { interpolateYlOrRd } from 'd3-scale-chromatic';

const myColor = scaleSequential().domain([0, 10]).interpolator(interpolateYlOrRd);

export { myColor };
