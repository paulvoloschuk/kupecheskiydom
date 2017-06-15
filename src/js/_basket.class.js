class Basket {
  constructor(container) {
    this.container = container;
    instances.basket = this;
    this.render();

  }
  show(product) {
    let template = document.createElement('div'),
        currency = String.fromCharCode(product.currencyCode[product.props.currency]),
        deleteProduct = !!product.ammount ? '<button class="remove">Удалить</button>' : '',
        buyProduct = !!product.ammount ? 'Изменить' : 'В корзину';

     template.innerHTML = `
      <div class="basket-product">
        <div>
          <p class="description">
            ${product.props.description || `<div class="no-data">Нет описания</div>`}
          </p>
        </div>
        <div>
          <img src="${product.props.image}" alt="${product.props.name}" title="Купить ${product.props.name}!" />
          <p><span class="price">${product.props.price} ${currency}</span></p>
          <p><form><input class="ammount" type="text" value="${product.ammount || 1}" maxlength="2" /></form></p>
          <p><button class="buy">${buyProduct}</button>${deleteProduct}</p>
        </div>
      <div>
    `;

    // ACTIONS
    let ammount = template.querySelector('.ammount'),
        form = template.querySelector('form'),
        buy = template.querySelector('.buy'),
        remove = template.querySelector('.remove') || false,
        changeAmmount = (value = false) => e => {
          e.preventDefault();
          product.ammount = (value !== false) ? value : +ammount.value;
          instances.modal.toggle();
          instances.store.build();
          this.render();
        };

    ammount.onkeydown = secureNumInput(100, 0, 1);
    buy.onclick = form.onsubmit = changeAmmount();
    if (remove) remove.onclick = changeAmmount(0);

    instances.modal.render('Страница товара', template.firstElementChild);
    ammount.focus();
  }
  checkout() {
    let template = document.createElement('div'),
        products = instances.store.products.filter(item => !!item.ammount),
        productContainer = document.createElement('div');

    // If basket empty, closeing it
    if (products.length === 0) {
      instances.modal.toggle();
      return;
    }

    products.map(item => productContainer.appendChild(item.render('basket')));

    let totalPrice = products.reduce((sum, item) => {
          if (!!item.ammount) sum += item.ammount * item.props.price;
          return sum;
        }, 0),
        currency = products[0].getCurrency();

    template.innerHTML = `
      <div class="basket-checkout">
        <div class="list">

        </div>
        <div>
          <div class="total-price">
            Общая сумма
            <span class="value">${totalPrice} ${currency}</span>
          </div>
            <form>
              <input type="text" name="name" placeholder="* Имя..." required />
              <input type="text" name="phone" placeholder="* Телефон..." required />
              <textarea name="comment" placeholder="Коментарий к заказу..."></textarea>
              <input type="submit" value="Отправить" />
            </form>
          </div>
        </div>
      </div>
    `;


    // ACTIONS
    let list = template.querySelector('.list'),
        form = template.querySelector('form');

    list.appendChild(productContainer);
    form.onsubmit = e => {
      e.preventDefault();
      instances.store.send(serializeForm(e.currentTarget.elements));
    }

    instances.modal.render('Оформление заказа', template.firstElementChild);
  }
  recount() {
    let currency = instances.store.products[0].getCurrency(),
        totalPrice = instances.store.products.reduce((sum, item) => {
              if (!!item.ammount) sum += item.ammount * item.props.price;
              return sum;
            }, 0);
    document.querySelector('.total-price .value').innerHTML = totalPrice + ' ' + currency;


  }
  render() {
    let template = document.createElement('div'),
        ammount = instances.store.products.reduce((sum, item) =>  sum + item.ammount * item.props.price, 0),
        count = instances.store.products.reduce((sum, item) =>  sum + item.ammount, 0),
        response = !!ammount ? `<p>${count} товар(ов) на сумму:<br /><span class="price"> ${ammount} рублей</span></p><button class="action">Оформить</button>` : '<div class="no-data">Пусто</div>'

    template.innerHTML = `
      <div id="basket">
        <h3>Корзина</h3>
        ${response}
      </div>
    `;

    // ACTIONS
    let action = template.querySelector('.action');

    if (action) action.onclick = this.checkout.bind(this);


    this.container.updateTo(template.firstElementChild);
  }
}
