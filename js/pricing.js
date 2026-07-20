/* ============================================================
   QuickPick — Pricing (single source of truth)
   Rates come from the official PRICE LIST.
   Price depends on: service type -> bin size -> collection frequency.
   ============================================================ */
(function (w) {
    "use strict";

    var FREQUENCIES = {
        "2days":   { label: "Every 2 days", note: "every 2 days",       perMonth: 15, segments: ["hostel"] },
        "3-4days": { label: "3/4 days",     note: "< 7 days",           perMonth: 6,  segments: ["standard"] },
        "4-5days": { label: "4/5 days",     note: "every 4–5 days",     perMonth: 6,  segments: ["hostel"] },
        "weekly":  { label: "Weekly",       note: "≥ 7 but < 14 days",  perMonth: 4,  segments: ["standard", "hostel"] },
        "biweekly":{ label: "Bi-Weekly",    note: "≥ 14 but < 25 days", perMonth: 2,  segments: ["standard", "hostel"] },
        "monthly": { label: "Monthly",      note: "≥ 25 days",          perMonth: 1,  segments: ["standard", "hostel"] }
    };

    // Display order (a frequency only shows if it belongs to the active segment)
    var ORDER = ["2days", "3-4days", "4-5days", "weekly", "biweekly", "monthly"];

    // Per-pickup rate in GHC: rates[segment][bin][frequency]
    var RATES = {
        standard: {
            "120L": { "3-4days": 15, "weekly": 20, "biweekly": 25, "monthly": 35 },
            "240L": { "3-4days": 25, "weekly": 30, "biweekly": 40, "monthly": 50 }
        },
        hostel: {
            "120L": { "2days": 10, "4-5days": 15, "weekly": 20, "biweekly": 25, "monthly": 35 },
            "240L": { "2days": 18, "4-5days": 25, "weekly": 30, "biweekly": 35, "monthly": 50 }
        }
    };

    var QP = {
        frequencies: FREQUENCIES,
        order: ORDER,
        rates: RATES,
        bins: ["120L", "240L"],
        serviceTypes: ["Residential", "Commercial", "Hostel"],
        registration: { "120L": 100, "240L": 170, ownBin: 50 },

        /* Residential and Commercial share one rate card; Hostel has its own */
        segmentOf: function (serviceType) {
            return /hostel/i.test(String(serviceType || "")) ? "hostel" : "standard";
        },

        segmentLabel: function (segment) {
            return segment === "hostel" ? "Hostel" : "Residential & Commercial";
        },

        /* Ordered frequencies available to a segment */
        frequenciesFor: function (segment) {
            var out = [];
            ORDER.forEach(function (key) {
                var f = FREQUENCIES[key];
                if (f && f.segments.indexOf(segment) !== -1) {
                    out.push({
                        key: key,
                        label: f.label,
                        note: f.note,
                        perMonth: f.perMonth
                    });
                }
            });
            return out;
        },

        /* -> { rate, perMonth, monthly } or null when not priced */
        lookup: function (serviceType, bin, freqKey) {
            var segment = this.segmentOf(serviceType);
            var byBin = RATES[segment] && RATES[segment][bin];
            var rate = byBin && byBin[freqKey];
            var freq = FREQUENCIES[freqKey];
            if (typeof rate !== "number" || !freq) return null;
            return {
                segment: segment,
                rate: rate,
                perMonth: freq.perMonth,
                monthly: rate * freq.perMonth,
                label: freq.label,
                note: freq.note
            };
        },

        /* Cheapest per-pickup rate for a bin (used for "from GHC x" copy) */
        lowestRate: function (bin) {
            var lowest = null;
            ["standard", "hostel"].forEach(function (seg) {
                var byBin = RATES[seg] && RATES[seg][bin];
                if (!byBin) return;
                Object.keys(byBin).forEach(function (k) {
                    if (lowest === null || byBin[k] < lowest) lowest = byBin[k];
                });
            });
            return lowest;
        }
    };

    w.QP_PRICING = QP;
})(window);
