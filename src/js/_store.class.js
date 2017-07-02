class Store {
  constructor(urlToJSON = false, containerQuery = false) {
    instances.store = this;
    this.urlToSubmit = '/';
    this.container = {
      basket: document.querySelector(containerQuery + ' aside .basket-container'),
      filter: document.querySelector(containerQuery + ' aside .filter-container'),
      article: document.querySelector(containerQuery + ' article')
    };
    this.filter = false;
    this.basket = false;
    this.modal  = new Modal('#modalbox');
    this.init = false;

    // Getting JSON with products
    fetch(urlToJSON)
      .then(data => data.json())
      .then(json => {
        this.products = json.products.map((product, index) => new Product(product, index));
        this.exchangeCourse = json.exchangeCourse;
      })
      .then(() => this.build());
  }
  build() {
    // sessionStorage
    let activeShipments = this.products.filter(item => !!item.ammount);
    if (!this.init) {
        activeShipments = JSON.parse(sessionStorage.getItem('selected')) || [];
        if (activeShipments.length != 0) activeShipments.map(item => this.products[item.id].ammount = item.ammount );
    } else {sessionStorage.setItem('selected', JSON.stringify(this.products.filter(item => !!item.ammount).reduce((result, item) => {
              result.push({id: item.props.id, ammount: item.ammount});
              return result;
            },[])));
    }
    this.init = true;

    //Initializing filter & basket
    if (!this.filter) this.filter = new Filter(this.container.filter, this.products, this.build.bind(this));
    if (!this.basket) this.basket = new Basket(this.container.basket);

    this.container.article.innerHTML = '';
    this.filter.sort(this.products).map(item => this.container.article.appendChild(item.render()));
    if (this.container.article.children.length == 0) this.container.article.innerHTML = '<p class="no-data">По данному фильтру товаров нет</p>';


    // callback
    if (this.onLoad) this.onLoad();
  }
  send(data) {
    this.modal.toggle();
    data.shipments = this.products.filter(item => !!item.ammount).reduce((sum, item) => {
        sum.push({name:item.props.name, ammount: item.ammount})
        item.ammount = 0;
        return sum;
      },[]);
    sessionStorage.removeItem('selected');
    this.build();
    instances.basket.render();
    // fetch(this.urlToSubmit, {
    //   method: 'post',
    //   headers: {
    //     "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
    //   },
    //   body: JSON.stringify(data)
    // })
    // .then(data => data.json())
    // .then(data => {
    //   console.log('Request succeeded with JSON response', data);
    // })
    // .catch(error => {
    //   console.log('Request failed', error);
    // });

  }

}
