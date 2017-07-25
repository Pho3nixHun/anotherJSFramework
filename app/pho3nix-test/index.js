import Directive from 'app/lib/Directive';
import Layout from 'app/pho3nix-test/layout.html!';

const nop = Function.prototype;

customElements.define('pho3nix-test', class extends Directive {
  constructor() {
    super(Layout);
  }

  get properties() {
      return {
          test: 'TaDa!'
      }
  }
});

