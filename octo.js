(function () {
    "use strict";

    class Octo {
        static target(selectorArray) {
            return new OctoBuilder(selectorArray);
        }
    }

    class OctoBuilder {
        constructor(selectorArray) {
            this.context_ = new OctoContext(selectorArray);
        }

        build(callback) {
            callback(this.context_);
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
                }));
        }
    }

    class OctoContext {
        constructor(selectorArray) {
            this.data_ = {};
            this.selectorArray_ = selectorArray;
        }

        assert(actual) {
            return new OctoContextAssert(actual);
        }

        data(key, value) {
            if (value !== undefined) {
                this.data_[key] = value;
            }

            return this.data_[key];
        }

        when() {
            return new OctoContextWhen(this.selectorArray_);
        }
    }

    class OctoContextAssert {
        constructor(actual) {
            this.actual_ = actual;
        }

        isNotNull() {
            if (this.actual_ === undefined || this.actual_ === null) {
                throw new OctoContextAssertException("actual: {value} is null. expected: {value} is not null.");
            }
        }

        isNull() {
            if (this.actual_ !== undefined && this.actual_ !== null) {
                throw new OctoContextAssertException("actual: {value} is not null. expected: {value} is null.");
            }
        }
    }

    class OctoContextAssertException {
        constructor(message) {
            this.message = message;
        }
    }

    class OctoContextWhen {
        constructor(selectorArray) {
            this.eventListenerObject_ = {};
            this.selectorArray_ = selectorArray;
        }

        domContentLoaded() {
            return new OctoContextWhenDo((callback) => {
                window.addEventListener("DOMContentLoaded", (event) => {
                    document.querySelectorAll(this.selectorArray_.join()).forEach((value) => {
                        callback(new OctoComponent(value), event);
                    });
                });
            });
        }

        event(eventArray) {
            return new OctoContextWhenDo((callback) => {
                eventArray.forEach((value) => {
                    if (this.eventListenerObject_[value] === undefined) {
                        this.eventListenerObject_[value] = [];
                        document.addEventListener(value, (event) => {
                            this.eventListenerObject_[value].forEach((listener) => {
                                let propagation = (target) => {
                                    if (target === null) {
                                        return;
                                    }

                                    if (target.dataset.join === undefined) {
                                        if (target.matches(this.selectorArray_.join())) {
                                            listener(new OctoComponent(target), event);
                                        }
                                        propagation(target.parentElement);
                                    } else {
                                        document.querySelectorAll(target.dataset.join).forEach(propagation);
                                    }
                                };

                                propagation(event.target);
                            });
                        });
                    }

                    this.eventListenerObject_[value].push(callback);
                });
            });
        }
    }

    class OctoContextWhenDo {
        constructor(whenDoWrapper) {
            this.whenDoWrapper_ = whenDoWrapper;
        }

        do(callback) {
            this.whenDoWrapper_(callback);
        }
    }

    Octo.target([".dialog"]).build((context) => {
        context.when().event(["click"]).do((component, event) => {
            let dialog = event.target.dataset.dialog;
            context.assert(dialog).isNotNull();

            if (dialog === "open") {
                component.root.classList.add("dialog--open");
            } else {
                component.root.classList.remove("dialog--open");
            }
        });
    });

    Octo.target([".field"]).build((context) => {
        context.data("update", (component, event) => {
            let control = component.querySelector(".field__control");
            let label = component.querySelector(".field__label");

            context.assert(control).isNotNull();
            context.assert(label).isNotNull();

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
