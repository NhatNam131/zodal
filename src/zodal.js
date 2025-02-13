Zodal.elements = [];

function Zodal(options = {}) {
  if (!options.content && !options.templateId) {
    console.error("You must provide one of 'content' or 'templateId'");
    return;
  }

  if (options.content && options.templateId) {
    options.templateId = null;
    console.warn(
      "Both 'content' and 'templateId' are specified. 'content' will take precedence, and 'templateId' ignored"
    );
  }

  if (options.templateId) {
    this.template = document.querySelector(`#${options.templateId}`);

    if (!this.template) {
      console.error(`${options.templateId} does not exist`);
    }
  }

  this.opt = Object.assign(
    {
      closeMethod: ["button", "overlay", "escape"],
      cssClass: [],
      footer: false,
      destroyZodal: true,
    },
    options
  );

  this._footerButton = [];

  this.content = this.opt.content;

  const closeMethod = this.opt.closeMethod;
  this._closeBtn = closeMethod.includes("button");
  this._closeOverlay = closeMethod.includes("overlay");
  this._closeEscape = closeMethod.includes("escape");
}

Zodal.prototype._build = function () {
  const contentNode = this.content
    ? document.createElement("div")
    : this.template.content.cloneNode(true);

  if (this.content) {
    contentNode.innerHTML = this.content;
  }

  this._backdrop = document.createElement("div");
  this._backdrop.className = "zodal-backdrop";

  const container = document.createElement("div");
  container.className = "zodal-container";

  this.opt.cssClass.forEach((cssClass) => {
    container.classList.add(cssClass);
  });

  if (this._closeBtn) {
    const btnClose = this._createButton("&times;", "zodal-btn-close", () =>
      this.close()
    );
    container.append(btnClose);
  }

  this.zodalContent = document.createElement("div");
  this.zodalContent.className = "zodal-content";
  this.zodalContent.append(contentNode);

  container.append(this.zodalContent);

  if (this.opt.footer) {
    this._ZodalFooter = document.createElement("div");
    this._ZodalFooter.className = "zodal-footer";

    if (this._footerContent) {
      this._ZodalFooter.innerHTML = this._footerContent;
    }

    this._renderFooterButton();

    container.append(this._ZodalFooter);
  }

  this._backdrop.append(container);
  document.body.append(this._backdrop);
};

Zodal.prototype.setContent = function (content) {
  this.content = content;
  if (this.zodalContent) {
    this.zodalContent.innerHTML = this.content;
  }
};

Zodal.prototype._renderFooterContent = function () {
  if (this._ZodalFooter) {
    this._ZodalFooter.innerHTML = this._footerContent;
  }
};

Zodal.prototype.setFooterContent = function (html) {
  this._footerContent = html;
  this._renderFooterContent();
};

Zodal.prototype._renderFooterButton = function () {
  this._footerButton.forEach((button) => {
    this._ZodalFooter.append(button);
  });
};

Zodal.prototype._createButton = function (title, className, callback) {
  const button = document.createElement("button");
  button.innerHTML = title;
  button.className = className;
  button.onclick = callback;

  return button;
};

Zodal.prototype.addFooterButton = function (title, className, callback) {
  const button = this._createButton(title, className, callback);
  this._footerButton.push(button);

  if (this._ZodalFooter) {
    this._renderFooterButton();
  }
};

Zodal.prototype._getScrollWidth = function () {
  if (this._scrollBarWidth) {
    return this._scrollBarWidth;
  }

  const div = document.createElement("div");
  Object.assign(div.style, {
    overflow: "scroll",
    position: "absolute",
    top: "-9999px",
  });

  document.body.appendChild(div);

  this._scrollBarWidth = div.offsetWidth - div.clientWidth;

  document.body.removeChild(div);

  return this._scrollBarWidth;
};

Zodal.prototype.open = function () {
  Zodal.elements.push(this);

  if (!this._backdrop) {
    this._build();
  }

  setTimeout(() => {
    this._backdrop.classList.add("zodal-show");
  }, 0);

  document.body.classList.add("no-scroll");
  document.body.style.paddingRigth = this._getScrollWidth() + "px";

  if (this._closeOverlay) {
    this._backdrop.addEventListener("click", (e) => {
      if (e.target === this._backdrop) {
        this.close();
      }
    });
  }

  if (this._closeEscape) {
    document.addEventListener("keydown", (e) => {
      const lastZodal = Zodal.elements[Zodal.elements.length - 1];
      if (e.key === "Escape" && this === lastZodal) {
        this.close();
      }
    });
  }

  this._ontransitionend(this.opt.onOpen);

  return this._backdrop;
};

Zodal.prototype._ontransitionend = function (callback) {
  if (this._backdrop) {
    this._backdrop.ontransitionend = (e) => {
      if (e.propertyName !== "transform") return;
      if (typeof callback === "function") callback();
    };
  }
};

Zodal.prototype.close = function (destroy = this.opt.destroyZodal) {
  Zodal.elements.pop();

  if (this._backdrop) {
    this._backdrop.classList.remove("zodal-show");
  }
  this._ontransitionend(() => {
    if (destroy && this._backdrop) {
      this._backdrop.remove();
      this._backdrop = null;
      this._ZodalFooter = null;
    }

    document.body.classList.remove("no-sroll");
    document.body.style.paddingRight = "";

    if (typeof this.opt.onClose === "function") this.opt.onClose();
  });
};

Zodal.prototype.destroy = function () {
  this.close(true);
};
