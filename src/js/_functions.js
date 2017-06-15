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
