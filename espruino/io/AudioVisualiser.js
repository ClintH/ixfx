"use strict";
/**
 * Visualiser component
 *
 * Usage: import visualiser.js. Instantiate on document load, and pass in the
 * parent element into the constructor.
 *
 * eg: const v = new Visualiser(document.getElementById('renderer'));
 *
 * Data must be passed to the component via renderFreq or renderWave.
 *
 * Draws on https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API
 */
exports.__esModule = true;
var index_js_1 = require("../collections/index.js");
var NumberTracker_js_1 = require("../data/NumberTracker.js");
// TODO: This is an adaption of old code. Needs to be smartened up further
var AudioVisualiser = /** @class */ (function () {
    function AudioVisualiser(parentElem, audio) {
        var _this = this;
        var _a, _b;
        this.freqMaxRange = 200;
        this.lastPointer = { x: 0, y: 0 };
        this.pointerDown = false;
        this.pointerClicking = false;
        this.pointerClickDelayMs = 100;
        this.pointerDelaying = false;
        this.audio = audio;
        this.parent = parentElem;
        this.waveTracker = (0, NumberTracker_js_1.numberTracker)();
        this.freqTracker = (0, NumberTracker_js_1.numberTracker)();
        // Add HTML
        parentElem.innerHTML = "\n    <section>\n      <button id=\"rendererComponentToggle\">\uD83D\uDD3C</button>\n      <div>\n        <h1>Visualiser</h1>\n        <div style=\"display:flex; flex-wrap: wrap\">\n          <div class=\"visPanel\">\n            <h2>Frequency distribution</h2>\n            <br />\n            <canvas id=\"rendererComponentFreqData\" height=\"200\" width=\"400\"></canvas>\n          </div>\n          <div class=\"visPanel\">\n            <h2>Waveform</h2>\n            <button id=\"rendererComponentWaveReset\">Reset</button>\n            <div>\n              Press and hold on wave to measure\n            </div>\n            <br />\n            <canvas id=\"rendererComponentWaveData\" height=\"200\" width=\"400\"></canvas>\n          </div>\n        </div>\n      </div>\n    </section>\n    ";
        this.el = parentElem.children[0];
        (_a = document.getElementById("rendererComponentToggle")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", function () {
            _this.setExpanded(!_this.isExpanded());
        });
        this.el.addEventListener("pointermove", function (e) { return _this.onPointer(e); });
        //this.el.addEventListener(`touchbegin`, (e) => this.onPointer(e));
        this.el.addEventListener("pointerup", function () {
            _this.pointerDelaying = false;
            _this.pointerDown = false;
        });
        this.el.addEventListener("pointerdown", function () {
            _this.pointerDelaying = true;
            setTimeout(function () {
                if (_this.pointerDelaying) {
                    _this.pointerDelaying = false;
                    _this.pointerDown = true;
                }
            }, _this.pointerClickDelayMs);
        });
        this.el.addEventListener("pointerleave", function () {
            _this.pointerDelaying = false;
            _this.pointerDown = false;
        });
        (_b = document.getElementById("rendererComponentWaveReset")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", function () {
            _this.clear();
        });
    }
    AudioVisualiser.prototype.renderFreq = function (freq) {
        if (!this.isExpanded())
            return; // Don't render if collapsed
        if (!freq)
            return; // Data is undefined/null
        var canvas = document.getElementById("rendererComponentFreqData");
        if (canvas === null)
            throw new Error("Cannot find canvas element");
        var g = canvas.getContext("2d");
        if (g === null)
            throw new Error("Cannot create drawing context");
        var bins = freq.length;
        var canvasWidth = canvas.clientWidth;
        var canvasHeight = canvas.clientHeight;
        g.clearRect(0, 0, canvasWidth, canvasHeight);
        var pointer = this.getPointerRelativeTo(canvas);
        var width = (canvasWidth / bins);
        var minMax = index_js_1.Arrays.minMaxAvg(freq);
        //eslint-disable-next-line functional/no-let
        for (var i = 0; i < bins; i++) {
            if (!Number.isFinite(freq[i]))
                continue;
            var value = freq[i] - minMax.min;
            var valueRelative = value / this.freqMaxRange;
            var height = Math.abs(canvasHeight * valueRelative);
            var offset = canvasHeight - height;
            var hue = i / bins * 360;
            var left = i * width;
            g.fillStyle = "hsl(" + hue + ", 100%, 50%)";
            // Show info about data under pointer
            if (pointer.y > 0 && pointer.y <= canvasHeight && pointer.x >= left && pointer.x <= left + width) {
                // Keep track of data
                if (this.freqTracker.id !== i.toString()) {
                    this.freqTracker = (0, NumberTracker_js_1.numberTracker)(i.toString());
                }
                this.freqTracker.seen(freq[i]);
                var freqMma = this.freqTracker.getMinMaxAvg();
                // Display
                g.fillStyle = "black";
                if (this.audio) {
                    g.fillText("Frequency (".concat(i, ") at pointer: ").concat(this.audio.getFrequencyAtIndex(i).toLocaleString("en"), " - ").concat(this.audio.getFrequencyAtIndex(i + 1).toLocaleString("en")), 2, 10);
                }
                g.fillText("Raw value: ".concat(freq[i].toFixed(2)), 2, 20);
                g.fillText("Min: ".concat(freqMma.min.toFixed(2)), 2, 40);
                g.fillText("Max: ".concat(freqMma.max.toFixed(2)), 60, 40);
                g.fillText("Avg: ".concat(freqMma.avg.toFixed(2)), 120, 40);
            }
            g.fillRect(left, offset, width, height);
        }
    };
    AudioVisualiser.prototype.isExpanded = function () {
        var contentsElem = this.el.querySelector("div");
        if (contentsElem === null)
            throw new Error("contents div not found");
        return (contentsElem.style.display === "");
    };
    AudioVisualiser.prototype.setExpanded = function (value) {
        var contentsElem = this.el.querySelector("div");
        var button = this.el.querySelector("button");
        if (button === null)
            throw new Error("Button element not found");
        if (contentsElem === null)
            throw new Error("Contents element not found");
        if (value) {
            contentsElem.style.display = "";
            button.innerText = "\uD83D\uDD3C";
        }
        else {
            contentsElem.style.display = "none";
            button.innerText = "\uD83D\uDD3D";
        }
    };
    AudioVisualiser.prototype.clear = function () {
        this.clearCanvas(document.getElementById("rendererComponentFreqData"));
        this.clearCanvas(document.getElementById("rendererComponentWaveData"));
    };
    // Clears a canvas to white
    AudioVisualiser.prototype.clearCanvas = function (canvas) {
        if (canvas === null)
            throw new Error("Canvas is null");
        var g = canvas.getContext("2d");
        if (g === null)
            throw new Error("Cannot create drawing context");
        g.fillStyle = "white";
        g.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    };
    // Renders waveform data.
    // Adapted from MDN's AnalyserNode.getFloatTimeDomainData() example
    AudioVisualiser.prototype.renderWave = function (wave, bipolar) {
        if (bipolar === void 0) { bipolar = true; }
        if (!this.isExpanded())
            return; // Don't render if collapsed
        if (!wave)
            return; // Undefined or null data
        var canvas = document.getElementById("rendererComponentWaveData");
        if (canvas === null)
            throw new Error("Cannot find wave canvas");
        var g = canvas.getContext("2d");
        if (g === null)
            throw new Error("Cannot create drawing context for wave");
        var canvasWidth = canvas.clientWidth;
        var canvasHeight = canvas.clientHeight;
        var pointer = this.getPointerRelativeTo(canvas);
        var infoAreaHeight = 20;
        var infoAreaWidth = 60;
        var bins = wave.length;
        g.fillStyle = "white";
        g.fillRect(0, 0, infoAreaWidth, infoAreaHeight);
        var width = canvasWidth / bins;
        // Clears the screen with very light tint of white
        // to fade out last waveform. Set this higher to remove effect
        g.fillStyle = "rgba(255, 255, 255, 0.03)";
        g.fillRect(0, 20, canvasWidth, canvasHeight);
        g.fillStyle = "red";
        if (bipolar) {
            g.fillRect(0, canvasHeight / 2, canvasWidth, 1);
        }
        else {
            g.fillRect(0, canvasHeight - 1, canvasWidth, 1);
        }
        g.lineWidth = 1;
        g.strokeStyle = "black";
        g.beginPath();
        //eslint-disable-next-line functional/no-let
        var x = 0;
        //eslint-disable-next-line functional/no-let
        for (var i = 0; i < bins; i++) {
            var height = wave[i] * canvasHeight;
            var y = bipolar ? (canvasHeight / 2) - height : canvasHeight - height;
            if (i === 0) {
                g.moveTo(x, y);
            }
            else {
                g.lineTo(x, y);
            }
            x += width;
            if (this.pointerDown)
                this.waveTracker.seen(wave[i]);
        }
        g.lineTo(canvasWidth, bipolar ? canvasHeight / 2 : canvasHeight); //canvas.height / 2);
        g.stroke();
        // Draw
        if (this.pointerDown) {
            var waveMma = this.waveTracker.getMinMaxAvg();
            g.fillStyle = "rgba(255,255,0,1)";
            g.fillRect(infoAreaWidth, 0, 150, 20);
            g.fillStyle = "black";
            g.fillText("Min: " + waveMma.min.toFixed(2), 60, 10);
            g.fillText("Max: " + waveMma.max.toFixed(2), 110, 10);
            g.fillText("Avg: " + waveMma.avg.toFixed(2), 160, 10);
        }
        else {
            this.waveTracker.reset();
        }
        // Show info about data under pointer
        if (pointer.y > 0 && pointer.y <= canvasHeight && pointer.x >= 0 && pointer.x <= canvasWidth) {
            g.fillStyle = "black";
            g.fillText("Level: " + (1.0 - (pointer.y / canvasHeight)).toFixed(2), 2, 10);
        }
    };
    // Yields pointer position relative to given element
    AudioVisualiser.prototype.getPointerRelativeTo = function (elem) {
        var rect = elem.getBoundingClientRect();
        return {
            x: this.lastPointer.x - rect.left - window.scrollX,
            y: this.lastPointer.y - rect.top - window.scrollY //elem.offsetTop + window.scrollY
        };
    };
    // Keeps track of last pointer position in page coordinate space
    AudioVisualiser.prototype.onPointer = function (evt) {
        this.lastPointer = {
            x: evt.pageX,
            y: evt.pageY
        };
        evt.preventDefault();
    };
    return AudioVisualiser;
}());
exports["default"] = AudioVisualiser;
//# sourceMappingURL=AudioVisualiser.js.map