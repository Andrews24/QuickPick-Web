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

    /* ---- Launch countdown ---- */
    var cd = document.querySelector("#countdown");
    if (cd) {
        var target = new Date(cd.getAttribute("data-target")).getTime();
        var elD = cd.querySelector("[data-d]"),
            elH = cd.querySelector("[data-h]"),
            elM = cd.querySelector("[data-m]"),
            elS = cd.querySelector("[data-s]");
        function pad(n) { return n < 10 ? "0" + n : "" + n; }
        function tick() {
            var diff = target - Date.now();
            if (diff <= 0) {
                cd.innerHTML =
                    '<div class="countdown-live"><h3>🎉 We\'re Live! QuickPick is now serving your community.</h3></div>';
                clearInterval(timer);
                return;
            }
            var d = Math.floor(diff / 86400000);
            var h = Math.floor((diff % 86400000) / 3600000);
            var m = Math.floor((diff % 3600000) / 60000);
            var s = Math.floor((diff % 60000) / 1000);
            if (elD) elD.textContent = d;
            if (elH) elH.textContent = pad(h);
            if (elM) elM.textContent = pad(m);
            if (elS) elS.textContent = pad(s);
        }
        tick();
        var timer = setInterval(tick, 1000);
    }

    /* ---- Cost calculator ---- */
    var calc = document.querySelector("#costCalc");
    if (calc) {
        var binSel = calc.querySelector("#calcBin");
        var freqSel = calc.querySelector("#calcFreq");
        var amountEl = calc.querySelector("#calcAmount");
        var breakdownEl = calc.querySelector("#calcBreakdown");
        function recalc() {
            var opt = binSel.options[binSel.selectedIndex];
            var single = parseFloat(opt.value) || 0;
            var multi = parseFloat(opt.getAttribute("data-multi")) || single;
            var perMonth = parseFloat(freqSel.value) || 0;
            // One pickup a month = standard rate; multiple = discounted rate
            var rate = perMonth > 1 ? multi : single;
            var total = rate * perMonth;
            amountEl.innerHTML = "GHC " + total + " <small>/ month</small>";
            var binText = opt.text;
            var freqText = freqSel.options[freqSel.selectedIndex].text;
            var pickupWord = perMonth === 1 ? " pickup)" : " pickups)";
            breakdownEl.textContent =
                binText + " · " + freqText + " (GHC " + rate + " × " + perMonth + pickupWord;
        }
        binSel.addEventListener("change", recalc);
        freqSel.addEventListener("change", recalc);
        recalc();
    }

    /* ---- FAQ accordion ---- */
    document.querySelectorAll(".faq-q").forEach(function (q) {
        q.addEventListener("click", function () {
            var item = q.closest(".faq-item");
            var answer = item.querySelector(".faq-a");
            var isOpen = item.classList.toggle("open");
            answer.style.maxHeight = isOpen ? answer.scrollHeight + "px" : null;
        });
    });

    /* ---- Quick register → WhatsApp ---- */
    var quickReg = document.querySelector("#quickRegForm");
    if (quickReg) {
        quickReg.addEventListener("submit", function (e) {
            e.preventDefault();
            var d = new FormData(quickReg);
            var msg =
                "*QuickPick Registration Request*%0A%0A" +
                "Name: " + (d.get("name") || "") + "%0A" +
                "Phone: " + (d.get("phone") || "") + "%0A" +
                "Service: " + (d.get("service") || "") + "%0A" +
                "Bin size: " + (d.get("bin") || "") + "%0A" +
                "Frequency: " + (d.get("frequency") || "") + "%0A" +
                "Area / Location: " + (d.get("location") || "");
            window.open("https://wa.me/233249172520?text=" + msg, "_blank");
        });
    }

    /* ---- Detailed form: live estimated monthly cost ---- */
    var regEstimate = document.querySelector("#regEstimate");
    if (regEstimate) {
        var regForm2 = document.querySelector("#registrationForm");
        var valEl = document.querySelector("#regEstimateVal");
        var bdEl = document.querySelector("#regEstimateBd");
        function updateRegEstimate() {
            var bin = regForm2.querySelector('input[name="bin"]:checked');
            var freq = regForm2.querySelector('input[name="frequency"]:checked');
            if (!bin || !freq) {
                regEstimate.style.display = "none";
                return;
            }
            regEstimate.style.display = "";
            var single = parseFloat(bin.getAttribute("data-single")) || 0;
            var multi = parseFloat(bin.getAttribute("data-multi")) || single;
            var per = parseFloat(freq.getAttribute("data-permonth"));
            var binLabel = bin.parentElement.textContent.trim();
            var freqLabel = freq.parentElement.textContent.trim();
            if (!per || per <= 0) {
                // On Call — usage varies
                valEl.innerHTML = "GHC " + single + " <small>/ pickup</small>";
                bdEl.textContent = binLabel + " · " + freqLabel + " (varies with usage)";
                return;
            }
            var rate = per > 1 ? multi : single;
            var total = rate * per;
            var word = per === 1 ? " pickup" : " pickups";
            valEl.innerHTML = "GHC " + total + " <small>/ month</small>";
            bdEl.textContent =
                binLabel + " · " + freqLabel + " (GHC " + rate + " × " + per + word + ")";
        }
        regForm2
            .querySelectorAll('input[name="bin"], input[name="frequency"]')
            .forEach(function (r) {
                r.addEventListener("change", updateRegEstimate);
            });
    }

    /* ---- Detailed registration form → WhatsApp ---- */
    var sendDetailed = document.querySelector("#sendDetailedWa");
    if (sendDetailed) {
        sendDetailed.addEventListener("click", function (e) {
            e.preventDefault();
            var form = document.querySelector("#registrationForm");
            if (!form) return;
            var lines = ["*QuickPick Registration*", ""];
            form.querySelectorAll(".reg-section").forEach(function (sec) {
                var titleEl = sec.querySelector(".reg-section-title");
                if (!titleEl) return;
                var title = titleEl.textContent.replace(/^\s*\d+\.\s*/, "").trim();
                if (/official use/i.test(title)) return; // skip internal section
                var parts = [];
                // Text / date / select / textarea fields
                sec.querySelectorAll(
                    "input:not([type=radio]):not([type=checkbox]), textarea, select"
                ).forEach(function (inp) {
                    var lab = inp.previousElementSibling;
                    var labelText =
                        lab && lab.tagName === "LABEL" ? lab.textContent.trim() : "";
                    var val = (inp.value || "").trim();
                    if (val) parts.push("- " + labelText + ": " + val);
                });
                // Single-select (radio) groups
                sec.querySelectorAll(".checkbox-group").forEach(function (grp) {
                    var lab = grp.previousElementSibling;
                    var labelText =
                        lab && lab.tagName === "LABEL" ? lab.textContent.trim() : "";
                    var checked = grp.querySelector("input:checked");
                    if (checked) {
                        parts.push("- " + labelText + ": " + checked.parentElement.textContent.trim());
                    }
                });
                if (parts.length) {
                    lines.push("*" + title + "*");
                    lines = lines.concat(parts);
                    lines.push("");
                }
            });
            if (lines.length <= 2) {
                alert("Please fill in the form before sending.");
                return;
            }
            window.open(
                "https://wa.me/233249172520?text=" + encodeURIComponent(lines.join("\n")),
                "_blank"
            );
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
