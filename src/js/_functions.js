HTMLElement.prototype.updateTo = function(content) {
  if (typeof content === 'string') this.innerHTML = content;
  else if (content instanceof HTMLElement) {
    this.innerHTML = '';
    this.appendChild(content);
  }
}
function serializeForm(form) {
  return Array.from(form).reduce((result, input) => {
    if (input.type !== 'submit') result[input.name] = input.value;
    return result;
  }, {});
}
function secureNumInput(max, min, step = 1) {
  return function(e) {
    if ((e.keyCode < 48 || e.keyCode > 57) && !([8, 46, 37, 39, 13].indexOf(e.keyCode) + 1)) {
      if (e.keyCode == 38 && e.target.value < max - step)
        e.target.value = +e.target.value + step;
      if (e.keyCode == 40 && e.target.value > min + step)
        e.target.value = +e.target.value - step;
      e.preventDefault();
    }
  }
}
const EasingFunctions = {
  linear: function (t) { return t },
  easeInQuad: function (t) { return t*t },
  easeOutQuad: function (t) { return t*(2-t) },
  easeInOutQuad: function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
  easeInCubic: function (t) { return t*t*t },
  easeOutCubic: function (t) { return (--t)*t*t+1 },
  easeInOutCubic: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
  easeInQuart: function (t) { return t*t*t*t },
  easeOutQuart: function (t) { return 1-(--t)*t*t*t },
  easeInOutQuart: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
  easeInQuint: function (t) { return t*t*t*t*t },
  easeOutQuint: function (t) { return 1+(--t)*t*t*t*t },
  easeInOutQuint: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t }
}
function scrollTo(e) {
  e.preventDefault();
  let scrollTo = document.getElementById(this.href.match(/[a-zA-Z]+$/i)[0]).offsetTop,
      fora = document.getElementById('lazyscroll').offsetHeight,
      scrollFrom = window.pageYOffset,
      scrollDifference = scrollTo - scrollFrom,
      duration = 400,
      fps = 120,
      timestamp = performance.now(),
      ease = 'linear',
      timer = setInterval(() => {
        let animationTime = performance.now() - timestamp;
        if (animationTime >= duration) clearInterval(timer);
        window.scrollTo(0, scrollFrom + (EasingFunctions[ease](animationTime / duration) * scrollDifference) - fora);
      }, 1000 / fps)
}
