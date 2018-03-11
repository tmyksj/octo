(function () {
    "use strict";

    class Octo {
        constructor() {
            this.initializers = [];

            window.addEventListener("DOMContentLoaded", (function (event) {
                for (let initializer of this.initializers) {
                    initializer();
                }
            }).bind(this));
        }

        static is(className, element) {
            if (element === undefined || element === null) {
                return false;
            }

            let postfixes = ["", "--error", "--info", "--negative", "--positive", "--warn"];
            for (let postfix of postfixes) {
                if (element.classList.contains(className + postfix)) {
                    return true;
                }
            }

            return false;
        }
    }

    let octo = new Octo();

    octo.initializers.push(function () {
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

            if (!Octo.is("field", field)) {
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
