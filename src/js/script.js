'use strict';
let instances = {};

//= _functions.js
//= _store.class.js
//= _modal.class.js
//= _product.class.js
//= _basket.class.js
//= _filter.class.js

window.onload = () => {

  // Store
  let products = new Store('static/products.json', '#products .content');
  products.onLoad = () => {
    let nav = document.querySelector('nav'),
        aside = document.querySelector('aside'),
        slide = document.querySelector('aside .slide');
    window.onscroll = (e) => {
      let correctScroll = e.target.scrollingElement.scrollTop - aside.offsetTop + nav.offsetHeight;
      if (correctScroll < 0) slide.style.transform = 'translateY(0px)';
      else if (correctScroll > aside.offsetHeight - slide.offsetHeight) slide.style.transform = `translateY(${aside.offsetHeight - slide.offsetHeight}px)`;
      else if (correctScroll > 0 && correctScroll < aside.offsetHeight - slide.offsetHeight) slide.style.transform = `translateY(${correctScroll}px)`;
    }
  }

  // Scroll
  Array.from(document.querySelectorAll('a[href^="#"]')).map(item => item.onclick = scrollTo);
}
