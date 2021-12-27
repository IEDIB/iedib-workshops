var Timer = function (cb, delay) {
    this.cb = cb;
    this._start = null;
    this.remaining = 1000 * delay;
}
Timer.prototype = {
    play: function (delay2) {
        if (this.id) {
            clearTimeout(this.id);
        }
        if (this._start) {
            this.remaining -= new Date().getTime() - this._start;
        }
        if (delay2) {
            // Redefine the delay
            this.remaining = 1000 * delay2;
        }
        this._start = new Date().getTime();
        this.id = setTimeout(this.cb, this.remaining);
    },
    stop: function () {
        if (this.id) {
            clearTimeout(this.id);
            this.id = null;
        }
        this._start = null;
        this.remaining = 0;
    },
    pause: function () {
        if (this.id) {
            clearTimeout(this.id);
            this.id = null;
        }
        if (this._start) {
            this.remaining -= new Date().getTime() - this._start;
        }
    }
};
module.exports = Timer;