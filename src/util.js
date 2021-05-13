class StopWatch {
  constructor(taskName) {
    this.taskName = taskName;
    this.start = performance.now();
  }

  stop() {
    const duration = performance.now() - this.start;
    console.log(`${this.taskName} took ${duration} ms`);
  }
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export { StopWatch, clamp };
