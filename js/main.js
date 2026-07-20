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

    /* ---- Price table + segment toggle ---- */
    var priceBody = document.querySelector("#priceTableBody");
    if (priceBody && window.QP_PRICING) {
        var PT = window.QP_PRICING;
        var renderPriceTable = function (segment) {
            var rows = "";
            PT.frequenciesFor(segment).forEach(function (f) {
                var a = PT.rates[segment]["120L"][f.key];
                var b = PT.rates[segment]["240L"][f.key];
                rows +=
                    '<tr><td class="freq"><strong>' + f.label + "</strong><small>" + f.note + "</small></td>" +
                    '<td class="rate">GHC ' + a + "</td>" +
                    '<td class="rate">GHC ' + b + "</td>" +
                    '<td class="cost-col"><span>GHC ' + a * f.perMonth + " <small>(120L)</small></span>" +
                    "<span>GHC " + b * f.perMonth + " <small>(240L)</small></span></td></tr>";
            });
            priceBody.innerHTML = rows;
        };
        renderPriceTable("standard");
        var segToggle = document.querySelector("#segToggle");
        if (segToggle) {
            segToggle.querySelectorAll(".seg-btn").forEach(function (btn) {
                btn.addEventListener("click", function () {
                    segToggle.querySelectorAll(".seg-btn").forEach(function (b) {
                        b.classList.remove("active");
                    });
                    btn.classList.add("active");
                    renderPriceTable(btn.getAttribute("data-segment"));
                });
            });
        }
    }

    /* ---- Cost calculator ---- */
    var calc = document.querySelector("#costCalc");
    if (calc && window.QP_PRICING) {
        var PC = window.QP_PRICING;
        var svcSel = calc.querySelector("#calcService");
        var binSel = calc.querySelector("#calcBin");
        var freqSel = calc.querySelector("#calcFreq");
        var amountEl = calc.querySelector("#calcAmount");
        var breakdownEl = calc.querySelector("#calcBreakdown");

        var fillFreq = function () {
            var seg = PC.segmentOf(svcSel.value);
            var prev = freqSel.value;
            var opts = PC.frequenciesFor(seg);
            freqSel.innerHTML = opts
                .map(function (f) {
                    return '<option value="' + f.key + '">' + f.label + " (" + f.perMonth + " / month)</option>";
                })
                .join("");
            var keep = opts.some(function (f) {
                return f.key === prev;
            });
            freqSel.value = keep ? prev : "weekly";
        };

        var recalc = function () {
            var r = PC.lookup(svcSel.value, binSel.value, freqSel.value);
            if (!r) {
                amountEl.textContent = "—";
                breakdownEl.textContent = "";
                return;
            }
            amountEl.innerHTML = "GHC " + r.monthly + " <small>/ month</small>";
            var word = r.perMonth === 1 ? " pickup)" : " pickups)";
            breakdownEl.textContent =
                svcSel.value + " · " + binSel.value + " · " + r.label +
                " (GHC " + r.rate + " × " + r.perMonth + word;
        };

        svcSel.addEventListener("change", function () {
            fillFreq();
            recalc();
        });
        binSel.addEventListener("change", recalc);
        freqSel.addEventListener("change", recalc);
        fillFreq();
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

    /* ---- Detailed form: service-aware frequency + live estimate ---- */
    var regEstimate = document.querySelector("#regEstimate");
    if (regEstimate && window.QP_PRICING) {
        var PR = window.QP_PRICING;
        var regForm2 = document.querySelector("#registrationForm");
        var lblEl = regEstimate.querySelector(".lbl");
        var valEl = document.querySelector("#regEstimateVal");
        var bdEl = document.querySelector("#regEstimateBd");

        var currentService = function () {
            var s = regForm2.querySelector('input[name="service"]:checked');
            return s ? s.value || s.parentElement.textContent.trim() : "Residential";
        };

        // Only show the frequencies that apply to the chosen service type
        var syncFrequencies = function () {
            var seg = PR.segmentOf(currentService());
            regForm2.querySelectorAll('input[name="frequency"]').forEach(function (r) {
                var f = PR.frequencies[r.value];
                var ok = f && f.segments.indexOf(seg) !== -1;
                r.parentElement.style.display = ok ? "" : "none";
                if (!ok && r.checked) r.checked = false;
            });
        };

        var updateRegEstimate = function () {
            var bin = regForm2.querySelector('input[name="bin"]:checked');
            if (!bin) {
                regEstimate.style.display = "none";
                return;
            }
            var binLabel = bin.parentElement.textContent.trim();
            // Flat one-time fee (customer already owns a bin)
            var flat = parseFloat(bin.getAttribute("data-flat"));
            if (flat) {
                regEstimate.style.display = "";
                if (lblEl) lblEl.textContent = "Registration fee";
                valEl.innerHTML = "GHC " + flat + " <small>one-time</small>";
                bdEl.textContent =
                    binLabel + " · first pickup FREE · pickup price based on your bin size";
                return;
            }
            var freq = regForm2.querySelector('input[name="frequency"]:checked');
            if (!freq) {
                regEstimate.style.display = "none";
                return;
            }
            var svc = currentService();
            var r = PR.lookup(svc, bin.value, freq.value);
            if (!r) {
                regEstimate.style.display = "none";
                return;
            }
            regEstimate.style.display = "";
            if (lblEl) lblEl.textContent = "Estimated monthly cost";
            valEl.innerHTML = "GHC " + r.monthly + " <small>/ month</small>";
            var word = r.perMonth === 1 ? " pickup" : " pickups";
            bdEl.textContent =
                svc + " · " + binLabel + " · " + r.label +
                " (GHC " + r.rate + " × " + r.perMonth + word + ")";
        };

        regForm2
            .querySelectorAll('input[name="service"], input[name="bin"], input[name="frequency"]')
            .forEach(function (input) {
                input.addEventListener("change", function () {
                    if (input.name === "service") syncFrequencies();
                    updateRegEstimate();
                });
            });
        syncFrequencies();
    }

    /* ---- Quick register: frequency options follow service type ---- */
    var qrService = document.querySelector("#qrService");
    var qrFreq = document.querySelector("#qrFreq");
    if (qrService && qrFreq && window.QP_PRICING) {
        var PQ = window.QP_PRICING;
        var fillQuickFreq = function () {
            var seg = PQ.segmentOf(qrService.value);
            var prev = qrFreq.value;
            var opts = PQ.frequenciesFor(seg);
            qrFreq.innerHTML = opts
                .map(function (f) {
                    return "<option>" + f.label + "</option>";
                })
                .join("");
            var keep = opts.some(function (f) {
                return f.label === prev;
            });
            qrFreq.value = keep ? prev : "Weekly";
        };
        qrService.addEventListener("change", fillQuickFreq);
        fillQuickFreq();
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
