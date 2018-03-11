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
        let targets = document.querySelectorAll("input, select, textarea");
        for (let target of targets) {
            update(target);
        }

        document.addEventListener("change", function (event) {
            update(event.target);
        });

        document.addEventListener("input", function (event) {
            update(event.target);
        });

        function update(target) {
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
        }
    });
})();
