(function () {
    "use strict";

    let initializers = [];
    let utilities = {
        classList: {
            contains: function (element, className) {
                let postfixes = ["", "--error", "--info", "--negative", "--positive", "--warn"];
                for (let postfix of postfixes) {
                    if (element.classList.contains(className + postfix)) {
                        return true;
                    }
                }
                return false;
            }
        }
    };

    window.addEventListener("DOMContentLoaded", function (event) {
        for (let initializer of initializers) {
            initializer();
        }
    });

    initializers.push(function () {
        document.addEventListener("input", function (event) {
            let target = event.target;
            let field = target.parentElement;

            if (field === undefined
                    || field === null
                    || !utilities.classList.contains(field, "field")) {
                return;
            }

            if (target.value === "") {
                delete field.dataset.dirty;
            } else {
                field.dataset.dirty = "";
            }
        });
    });
})();
