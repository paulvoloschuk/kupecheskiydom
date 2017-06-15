class Filter {
  constructor(container, products, callback) {
    this.products = products;
    this.callback = callback;
    this.sortFunction = {
      search: item => item.props.name.includes(this.filterConditions.search),
      category: item => item.props.category === this.filterConditions.category,
      min: item => item.props.price > this.filterConditions.min,
      max: item => item.props.price < this.filterConditions.max
    }

    // Rendering aside
    container.appendChild(this.render());

  }
  sort(products) {
    if(this.filterConditions) {
      Object.keys(this.filterConditions).map(condition => {
        if(this.filterConditions[condition] !== '') products = products.filter(this.sortFunction[condition]);
      });
    }
    return products;
  }
  render() {
    let template = document.createElement('div'),
        categories = this.products.reduce((array, item) => {
            if (!(array.indexOf(item.props.category) + 1)) array.push(item.props.category);
            return array;
          }, []),
        selectOptions = categories.reduce((row, item) => row += `<option value="${item}">${item}</option>`, '<option value="">все</option>');

    template.innerHTML = `
      <form id="filter">
        <label>
          <input type="text" name="search" placeholder="поиск...">
        </label>
        <hr />
        <span>Категория</span>
        <label>
          <select name="category">
            ${selectOptions}
          </select>
        </label>
        <hr />
        <span>Цена</span>
        <label class="inline">
          <input type="text" class="price" name="min" placeholder="от...">
        </label>
        <label class="inline">
          <input type="text" class="price" name="max" placeholder="до...">
        </label>
      </form>
    `;

    // ACTIONS
    this.form = template.querySelector('form');
    let numInputs = Array.from(template.querySelectorAll('.price'));

    this.form.onchange = this.form.onsubmit = (e) => {
      this.filterConditions = serializeForm(e.currentTarget.elements);
      this.callback();
    }
    numInputs.map(item => item.onkeydown = secureNumInput(2000, 0, 100))


    return template.firstElementChild;
  }
}
