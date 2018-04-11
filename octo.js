(function () {
    "use strict";

    class Octo {
        static assert(actual) {
            return new OctoAssert(actual);
        }

        static buildComponent(selectorArray, callback) {
            callback(new OctoComponentContext(selectorArray));
        }
    }

    class OctoAssert {
        constructor(actual) {
            this.actual_ = actual;
        }

        isNotNull() {
            if (this.actual_ === undefined || this.actual_ === null) {
                throw new OctoAssertException("actual: {value} is null. expected: {value} is not null.");
            }
        }

        isNull() {
            if (this.actual_ !== undefined && this.actual_ !== null) {
                throw new OctoAssertException("actual: {value} is not null. expected: {value} is null.");
            }
        }
    }

    class OctoAssertException {
        constructor(message) {
            this.message = message;
        }
    }

    class OctoComponent {
        constructor(root) {
            this.root = root;
        }

        querySelector(selector) {
            let elementArray = this.querySelectorAll(selector);
            return (elementArray.length > 0 ? elementArray[0] : null);
        }

        querySelectorAll(selector) {
            return Array.from(this.root.querySelectorAll(selector))
                .concat(Array.from(document.querySelectorAll("[data-join]")).filter((value, index, array) => {
                    return this.root.matches(value.dataset.join);
                })).filter((value, index, array) => {
                    return (index === array.indexOf(value));
                });
        }
    }

    class OctoComponentContext {
        constructor(selectorArray) {
            this.data_ = {};
            this.selectorArray_ = selectorArray;
        }

        data(key, value) {
            if (value !== undefined) {
                this.data_[key] = value;
            }

            return this.data_[key];
        }

        when() {
            return new OctoComponentContextWhen(this.selectorArray_);
        }
    }

    class OctoComponentContextWhen {
        constructor(selectorArray) {
            this.selectorArray_ = selectorArray;
        }

        domContentLoaded() {
            return new OctoComponentContextWhenDo((callback) => {
                OctoEventManager.addEventListener("DOMContentLoaded", (event) => {
                    document.querySelectorAll(this.selectorArray_.join()).forEach((value) => {
                        callback(new OctoComponent(value), event);
                    });
                });
            });
        }

        event(eventArray) {
            return new OctoComponentContextWhenDo((callback) => {
                eventArray.forEach((value) => {
                    OctoEventManager.addEventListener(value, (event) => {
                        let propagation = (target) => {
                            if (target === null) {
                                return;
                            }

                            if (target.dataset.join === undefined) {
                                if (target.matches(this.selectorArray_.join())) {
                                    callback(new OctoComponent(target), event);
                                }
                                propagation(target.parentElement);
                            } else {
                                document.querySelectorAll(target.dataset.join).forEach(propagation);
                            }
                        };

                        propagation(event.target);
                    });
                });
            });
        }
    }

    class OctoComponentContextWhenDo {
        constructor(whenDoWrapper) {
            this.whenDoWrapper_ = whenDoWrapper;
        }

        do(callback) {
            this.whenDoWrapper_(callback);
        }
    }

    class OctoEventManager {
        constructor() {
            this.eventListenerObject_ = {};
        }

        static addEventListener(type, listener) {
            if (this.instance_ === undefined) {
                this.instance_ = new OctoEventManager();
            }

            this.instance_.addEventListener_(type, listener);
        }

        addEventListener_(type, listener) {
            if (this.eventListenerObject_[type] === undefined) {
                this.eventListenerObject_[type] = [];
                (type === "DOMContentLoaded" ? window : document).addEventListener(type, (event) => {
                    this.eventListenerObject_[type].forEach((l) => { l(event); });
                });
            }

            this.eventListenerObject_[type].push(listener);
        }
    }

    Octo.buildComponent([".dialog"], (context) => {
        context.when().event(["click"]).do((component, event) => {
            let dialog = event.target.dataset.dialog;

            if (dialog === "open") {
                component.root.classList.add("dialog--open");
            } else if (dialog === "close") {
                component.root.classList.remove("dialog--open");
            }
        });
    });

    Octo.buildComponent([".field"], (context) => {
        context.data("update", (component, event) => {
            let control = component.querySelector(".field__control");
            let label = component.querySelector(".field__label");

            Octo.assert(control).isNotNull();
            Octo.assert(label).isNotNull();

            if (control.value === "") {
                label.classList.remove("field__label--dirty")
            } else {
                label.classList.add("field__label--dirty")
            }
        });

        context.when().domContentLoaded().do(context.data("update"));
        context.when().event(["change", "input"]).do(context.data("update"));
    });
})();
