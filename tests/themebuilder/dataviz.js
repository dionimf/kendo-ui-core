(function() {
    var ThemeBuilder = kendo.ThemeBuilder,
        JsonConstants = kendo.JsonConstants;

    function createChart(options) {
        chart = $("<div />")
            .appendTo(QUnit.fixture)
            .kendoChart(kendo.deepExtend({}, options))
            .data("kendoChart");

        return chart;
    }

    var fancyColor = "#b4d455",
        chart, constants;

    module("themebuilder json constants (dataviz)", {
        teardown: function() {
            kendo.destroy(QUnit.fixture);
        }
    });

    function createThemedChart(theme) {
        kendo.dataviz.ui.registerTheme("foo", {
            chart: theme
        });

        createChart({ theme: "foo" });
    }

    test("infer infers basic constant", function() {
        createThemedChart({
            title: { color: "#b4d455" }
        });

        constants = new JsonConstants({
            constants: {
                "chart.title.color": {
                    property: "color"
                }
            }
        });

        constants.infer(document);

        equal(constants.constants["chart.title.color"].value, "#b4d455");
    });

    test("infer infers multiple constants", function() {
        createThemedChart({
            title: { color: "#b4d455" },
            tooltip: { background: "#f1f1f1" }
        });

        constants = new JsonConstants({
            constants: {
                "chart.title.color": { property: "color" },
                "chart.tooltip.background": { property: "color" }
            }
        });

        constants.infer(document);

        equal(constants.constants["chart.tooltip.background"].value, "#f1f1f1");
    });

    test("applyTheme applies theme to target document", function() {
        createThemedChart({
            title: { color: "#b4d455" },
        });

        constants = new JsonConstants({
            constants: {
                "chart.title.color": { property: "color", value: fancyColor }
            }
        });

        constants.applyTheme(document);

        chart = $("[data-role=chart]").data("kendoChart");

        equal(chart.options.title.color, fancyColor);
    });

    test("infer infers array elements", function() {
        createThemedChart({
            seriesColors: [ fancyColor ]
        });

        constants = new JsonConstants({
            constants: {
                "chart.seriesColors[0]": { property: "color" }
            }
        });

        constants.infer(document);

        equal(constants.constants["chart.seriesColors[0]"].value, fancyColor);
    });

    test("serialized array properties are within an array", 2, function() {
        constants = new JsonConstants({
            constants: {
                "chart.seriesColors[0]": { property: "color", value: fancyColor }
            }
        });

        constants.source("json", function(theme) {
            ok($.isArray(theme.chart.seriesColors));
            equal(theme.chart.seriesColors[0], fancyColor);
        });
    });

    test("serializing multiple array items", 3, function() {
        constants = new JsonConstants({
            constants: {
                "chart.seriesColors[0]": { property: "color", value: "#ff0000" },
                "chart.seriesColors[1]": { property: "color", value: "#00ff00" }
            }
        });

        constants.source("json", function(theme) {
            equal(theme.chart.seriesColors.length, 2);
            equal(theme.chart.seriesColors[0], "#ff0000");
            equal(theme.chart.seriesColors[1], "#00ff00");
        });
    });

    test("'transparent' values are serialized as empty strings", 1, function() {
        constants = new JsonConstants({
            constants: {
                "chart.plotArea.background": { property: "color", value: "transparent" }
            }
        });

        constants.source("json", function(theme) {
            equal(theme.chart.plotArea.background, "");
        });
    });

    test("deserialize gets constant values from theme", function() {
        constants = new JsonConstants({
            constants: {
                "chart.plotArea.background": { property: "color", value: "#ff0000" }
            }
        });

        constants.deserialize('{ "chart": { "plotArea": { "background": "#00ff00" } } }', document);

        equal(constants.constants["chart.plotArea.background"].value, "#00ff00");
    });

    test("deserialize works for array properties", function() {
        constants = new JsonConstants({
            constants: {
                "chart.seriesDefaults[0]": { property: "color", value: "#ff0000" },
                "chart.seriesDefaults[1]": { property: "color", value: "#ff0000" }
            }
        });

        constants.deserialize('{ "chart": { "seriesDefaults": [ "#00ff00", "#0000ff" ] } }', document);

        equal(constants.constants["chart.seriesDefaults[0]"].value, "#00ff00");
        equal(constants.constants["chart.seriesDefaults[1]"].value, "#0000ff");
    });

    test("deserialize works with source() output", 1, function() {
        constants = new JsonConstants({
            constants: {
                "chart.plotArea.background": { property: "color", value: "#ff0000" }
            }
        });

        constants.source("string", function(source) {
            delete constants.constants["chart.plotArea.background"].value;

            constants.deserialize(source, document);

            equal(constants.constants["chart.plotArea.background"].value, "#ff0000");
        });
    });

    test("deserializing fails silently for arbitrary data", function() {
        constants = new JsonConstants({
            constants: {
                "chart.plotArea.background": { property: "color", value: "#ff0000" }
            }
        });

        constants.deserialize("// foo bar baz\nvar test = 1;", document);

        equal(constants.constants["chart.plotArea.background"].value, "#ff0000");
    });
})();
