class Product {
  constructor(data, id) {
    this.ammount = 0;
    this.props = data;
    this.props.id = id;
    this.currencyCode = {
      r: '8381',
      g: '8372',
      d: '36'
    }
  }
  getCurrency() {
    return String.fromCharCode(this.currencyCode[this.props.currency])
  }
  render(mode = false) {
    let currency = this.getCurrency(),
        template = document.createElement('div'),
        inBasket = !!this.ammount ? 'in-basket' : '',
        buttonText = !!this.ammount ? `В корзине (${this.ammount})` : 'Купить';

    if (mode === 'basket') {

      template.innerHTML = `
        <div class="item">
          <img src="${this.props.image}" alt="${this.props.name}" />
          <p>${this.props.name}</p>
            <p>
              <span class="price">${this.props.price} ${currency}</span> x
              <input class="ammount" type="text" value="${this.ammount}" /> =
              <span class="result-price">${this.props.price * this.ammount} ${currency}</span>
              <button class="remove">Удалить</button>

            </p>
        </div>
      `;

      // ACTIONS
      let ammount = template.querySelector('.ammount'),
          resultPrice = template.querySelector('.result-price'),
          remove = template.querySelector('.remove');

      ammount.onkeydown = secureNumInput(100, 0, 1);
      ammount.onkeyup = e => {
        e.preventDefault();
        resultPrice.innerHTML = (this.ammount = +ammount.value) * this.props.price + ' ' + currency;
        instances.basket.render();
        instances.store.build();
        instances.basket.recount();
      }
      remove.onclick = e => {
        this.ammount = 0;
        instances.basket.render();
        instances.basket.checkout();
        instances.store.build();
      }


    } else {

      template.innerHTML = `
        <figure class="product ${inBasket}">
          <img src="${this.props.image}" alt="${this.props.name}" />
          <h3>${this.props.name}</h3>
          <div class="panel">
            <span class="price">${this.props.price} ${currency}</span>
            <button class="buy">${buttonText}</button>
          </div>
        </figure>
      `;

      // ACTIONS
      let container = template.querySelector('.product'),
          buy = template.querySelector('.buy');

      buy.onclick = e => {
        e.preventDefault();
        instances.basket.show(this);
        instances.basket.render();
      }
    }


    return template.firstElementChild;
  }
}
