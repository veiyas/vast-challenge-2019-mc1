import { select } from 'd3-selection';

export default class LoadAnimation {
  constructor(domElement) {
    this.element = select(domElement).append('div').attr('class', 'load-overlay').html(`
      <div class="row h-100 justify-content-center align-items-center">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    `);
  }

  finished() {
    this.element.remove();
  }
}
