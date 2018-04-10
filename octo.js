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

    class OctoContext {
        constructor(selectorArray) {
            this.def_ = {};
            this.selectorArray_ = selectorArray;
        }

        assert(actual) {
            return new OctoContextAssert(actual);
        }

        def(key, value) {
            if (value !== undefined) {
                this.def_[key] = value;
            }

            return this.def_[key];
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
            this.selectorArray_ = selectorArray;
        }

        domContentLoaded() {
            return new OctoContextWhenDo((callback) => {
                window.addEventListener("DOMContentLoaded", (event) => {
                    document.querySelectorAll(this.selectorArray_.join()).forEach((value) => {
                        callback(value);
                    });
                });
            });
        }

        event(eventArray) {
            return new OctoContextWhenDo((callback) => {
                eventArray.forEach((value) => {
                    document.addEventListener(value, (event) => {
                        for (let t = event.target; t !== null; t = t.parentElement) {
                            if (t.matches(this.selectorArray_.join())) {
                                callback(t);
                            }
                        }
                    });
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

    Octo.target([".field"]).build((context) => {
        context.def("update", (target) => {
            let control = target.querySelector(".field__control");
            let label = target.querySelector(".field__label");

            context.assert(control).isNotNull();
            context.assert(label).isNotNull();

            if (control.value === "") {
                label.classList.remove("field__label--dirty")
            } else {
                label.classList.add("field__label--dirty")
            }
        });

        context.when().domContentLoaded().do(context.def("update"));
        context.when().event(["change", "input"]).do(context.def("update"));
    });
})();
