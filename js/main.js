/* QuickPick Waste Management — site interactions */
(function () {
    "use strict";

    /* ---- Mobile nav toggle ---- */
    var toggle = document.querySelector(".menu-toggle");
    var links = document.querySelector(".nav-links");
    if (toggle && links) {
        toggle.addEventListener("click", function () {
            var open = links.classList.toggle("open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
            toggle.innerHTML = open
                ? '<i class="fa-solid fa-xmark"></i>'
                : '<i class="fa-solid fa-bars"></i>';
        });
        // Close menu when a link is tapped
        links.querySelectorAll("a").forEach(function (a) {
            a.addEventListener("click", function () {
                links.classList.remove("open");
                toggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
                toggle.setAttribute("aria-expanded", "false");
            });
        });
    }

    /* ---- Scroll reveal ---- */
    var revealEls = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window && revealEls.length) {
        var io = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("in");
                        io.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
        );
        revealEls.forEach(function (el) {
            io.observe(el);
        });
    } else {
        revealEls.forEach(function (el) {
            el.classList.add("in");
        });
    }

    /* ---- Animated counters ---- */
    var counters = document.querySelectorAll("[data-count]");
    if (counters.length) {
        var countObserver = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    var el = entry.target;
                    var target = parseFloat(el.getAttribute("data-count"));
                    var suffix = el.getAttribute("data-suffix") || "";
                    var dur = 1400,
                        start = null;
                    function step(ts) {
                        if (!start) start = ts;
                        var p = Math.min((ts - start) / dur, 1);
                        var eased = 1 - Math.pow(1 - p, 3);
                        el.textContent = Math.round(target * eased) + suffix;
                        if (p < 1) requestAnimationFrame(step);
                    }
                    requestAnimationFrame(step);
                    countObserver.unobserve(el);
                });
            },
            { threshold: 0.4 }
        );
        counters.forEach(function (el) {
            countObserver.observe(el);
        });
    }

    /* ---- Current year in footer ---- */
    var yearEls = document.querySelectorAll("[data-year]");
    yearEls.forEach(function (el) {
        el.textContent = new Date().getFullYear();
    });

    /* ---- Launch popup ---- */
    var popup = document.querySelector("#launchPopup");
    if (popup) {
        var closeBtns = popup.querySelectorAll("[data-close-popup]");
        function closePopup() {
            popup.style.display = "none";
        }
        closeBtns.forEach(function (b) {
            b.addEventListener("click", closePopup);
        });
        popup.addEventListener("click", function (e) {
            if (e.target === popup) closePopup();
        });
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") closePopup();
        });
    }

    /* ---- Lightbox (posters / campaign images) ---- */
    var lightbox = document.querySelector("#lightbox");
    if (lightbox) {
        var lbImg = lightbox.querySelector("img");
        document.querySelectorAll("[data-lightbox]").forEach(function (el) {
            el.addEventListener("click", function () {
                var src = el.getAttribute("data-lightbox") || el.getAttribute("src");
                if (src) {
                    lbImg.src = src;
                    lightbox.classList.add("open");
                }
            });
        });
        lightbox.addEventListener("click", function () {
            lightbox.classList.remove("open");
        });
    }

    /* ---- Contact / register form (mailto fallback) ---- */
    var form = document.querySelector("#registerForm");
    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            var data = new FormData(form);
            var name = data.get("name") || "";
            var phone = data.get("phone") || "";
            var binSize = data.get("binSize") || "";
            var location = data.get("location") || "";
            var message = data.get("message") || "";
            var subject = encodeURIComponent("QuickPick Registration — " + name);
            var body = encodeURIComponent(
                "Name: " + name +
                "\nPhone: " + phone +
                "\nPreferred bin size: " + binSize +
                "\nLocation: " + location +
                "\n\nMessage:\n" + message
            );
            window.location.href =
                "mailto:qpghana26@gmail.com?subject=" + subject + "&body=" + body;
        });
    }
})();
