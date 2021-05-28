import { extent, group, rollup, sum, timeParse, mean } from 'd3';

export default class ProcessedData {
  constructor(rawData) {
    this.parseTime = timeParse('%Y-%m-%d %H:%M:%S');

    this.data = rawData;
    this.columns = rawData.columns;

    // Replace empty strings with null as null values are ignored by d3 when calculating means
    for (const datum of this.data) {
      for (const column of this.columns) {
        if (datum[column] === '') datum[column] = null;
      }
    }

    this.timeExtent = extent(rawData, (d) => this.parseTime(d.time));

    this.groupedByTimeAndLocation = group(
      this.data,
      (d) => this.parseTime(d.time),
      (d) => d.location
    );

    this.groupedByLocationAndTime = group(
      this.data,
      (d) => d.location,
      (d) => this.parseTime(d.time)
    );

    this.totalNumberOfReportsPerLocation = new Map();
    group(this.data, (d) => d.location).forEach((val, key) => {
      this.totalNumberOfReportsPerLocation.set(key, val.length);
    });
  }
}
