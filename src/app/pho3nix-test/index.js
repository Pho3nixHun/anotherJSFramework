import Directive from '../lib/Directive';
import Layout from './layout.html';

const nop = Function.prototype;

export default customElements.define('pho3nix-test', class extends Directive {
  constructor() {
    super(Layout);
  }

  get properties() {
      return {
          test: 'TaDa!'
      }
  }
});
