import { csv } from 'd3';
import './style.scss';
// import { Tooltip, Toast, Popover } from 'bootstrap';

const main = async () => {
  try {
    const data = await csv('data/mc1-reports-data.csv');
    console.dir(data);
  } catch (err) {
    console.error(err);
  }
};

main();
