
var Scheduler = function() {
    this._queue = [];
    this._current = null;
    this._timer = null;
    this.initDelay = 0;
    this.delayBetweenJobs = 2000;
    return this;
}

Scheduler.prototype.start = function() {
    console.log("start");
    this.startWithDelay(this.initDelay);
};
Scheduler.prototype.startWithDelay = function(millis) {
    var self = this;
    if (!self._timer) {
        console.log("startWithDelay");
        self._timer = setTimeout(function() {
            self._next();
        }, millis);
    } else {
        console.log("startWithDelay:still running");
    }
};
Scheduler.prototype._next = function() {
    var self = this;
    if (self._queue && self._queue.length > 0 && !self._current) {
        self._current = self._queue[0];
        self._queue = self._queue.slice(1);
        console.log("_next: start");
        if (self._current && typeof self._current == "function") {
            self._current(function() {
                console.log("_next: stop");
                self.stop();
                self.startWithDelay(self.delayBetweenJobs);
            });
        } else {
            self.restart();
        }
    } else {
        self.stop();
    }
};
Scheduler.prototype.stop = function() {
    console.log("stop");
    this._current = null;
    clearTimeout(this._timer);
    this._timer = null;
};
Scheduler.prototype.restart = function() {
    console.log("restart");
    this.stop();
    this.start();
};
Scheduler.prototype.add = function(callback) {
    console.log("add");
    this._queue.push(callback);
    this.start();
};
Scheduler.prototype.remove = function(callback) {
    console.log("remove");
    this._queue = this._queue.filter(function(each) { return each !== callback; });
    this.start();
};

exports.Scheduler = new Scheduler();