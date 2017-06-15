class Modal {
  constructor(containerQuery) {
    instances.modal = this;
    this.container = document.querySelector(containerQuery);
    this.content = this.container.querySelector('.content');
    this.caption = this.container.querySelector('.caption');
    this.open = false;
    // DOM preprartions
    this.container.querySelector('.close').onclick = this.toggle.bind(this);

    // callbacks
    this.onOpen = false;
    this.onClose = false;
    this.onRender = false;
  }
  toggle() {
    document.body.classList.toggle('modalmode');
    this.open = !this.open;
    if (this.open && this.onOpen) this.onOpen();
    else if(this.onClose) this.onClose();
  }
  render(pageName, innerHTML) {
    this.content.updateTo(innerHTML);
    this.caption.updateTo(pageName);
    if (this.onRender) this.onRender();
    if (!this.open) this.toggle();
  }
}
