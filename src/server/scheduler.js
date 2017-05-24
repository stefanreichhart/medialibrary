let uuid = require('./uuid');

let Scheduler = exports = module.exports = function() { };

Scheduler.prototype.initialize = function() {
    this.queue = [];
    this.currentTask = null;
    this._timer = null;
    this.options = {
        initialDelay: 0,
        delayBetweenTasks: 2000
    };
    this.stats = {
        added: 0,
        removed: 0,
        completed: 0,
        errors: 0,
        exceededRetries: 0,
        minDuration: 0,
        maxDuration: 0,
        avgDuration: 0
    };
};

Scheduler.prototype.getStats = function() {
    return Object.assign({}, this.stats, {
        queue: this.queue.length,
        tasks: this.getTasks(),
        currentTask: !!this.currentTask,
        timer: !!this._timer,
        minDurationRemaining: this.options.initialDelay + (this.queue.length * (Math.max(1, this.stats.minDuration) + this.options.delayBetweenTasks)),
        avgDurationRemaining: this.options.initialDelay + (this.queue.length * (Math.max(1, this.stats.avgDuration) + this.options.delayBetweenTasks)),
        maxDurationRemaining: this.options.initialDelay + (this.queue.length * (Math.max(1, this.stats.maxDuration) + this.options.delayBetweenTasks))
    });
};

Scheduler.prototype.getTasks = function() {
    return this.queue.map(each => {
        let task = Object.assign({}, each);
        delete task['action'];
        return task;
    });
};

Scheduler.prototype.start = function() {
    if (!this._timer) {
        console.log("Scheduler: start");
        this.startWithDelay(this.options.initialDelay);
    }
};

Scheduler.prototype.startWithDelay = function(milliseconds) {
    let self = this;
    if (!self._timer) {
        console.log("Scheduler: start with delay");
        self._timer = setTimeout(function() {
            try {
                self._handleNextTask();
            } catch (error) {
                self._onError('Scheduler: primitive error')
                self.stop();
            }
        }, milliseconds);
    } 
};

Scheduler.prototype._handleNextTask = function() {
    if (this.queue && !this.currentTask) {
        let length = this.queue.length;
        if (length > 0) {
            console.log(`Scheduler: task of ${length}`);
            let task = this.currentTask = this.queue[0];
            this.queue = this.queue.slice(1);
            this._handleTask(task);
        } else {
            console.log("Scheduler: empty " + JSON.stringify(this.stats));
            this.stop();
        }
    } else {
        console.log("Scheduler: busy");
        this.stop();
    }
};

Scheduler.prototype._handleTask = function(task) {
    let self = this;
    let start = Date.now();
    if (task && task.action && typeof task.action == "function") {
        try {
            task.attempts++;
            let onComplete = function(fnComplete) {
                self.stats.completed++;
                let duration = self._handleDuration(start, Date.now());
                console.log(`Scheduler: task ${task.name} took ${duration} ms`);
                self.stop();
                self.startWithDelay(self.options.delayBetweenTasks);
            };
            let onError = function(error) {
                self._handleError(task, error);
                self._handleDuration(start, Date.now());
            };
            task.action(task, onComplete, onError);
        } catch (error) {
            self._handleError(task, error);
            self._handleDuration(start, Date.now());
        }
    } else {
        console.log(`Scheduler: bypass ${task}`);
        self._handleDuration(start, Date.now());
        self.restart();
    }
};

Scheduler.prototype._handleDuration = function(start, stop) {
    let duration = Math.max(1, stop - start);
    this.stats.minDuration = Math.min(1, this.stats.minDuration, duration);
    this.stats.maxDuration = Math.max(1, this.stats.maxDuration, duration);
    this.stats.avgDuration = Math.min(1, (this.stats.avgDuration + duration) / 2);
    return duration;
};

Scheduler.prototype._handleError = function(task, error, fnError) {
    let message = (error ? error.message : '') || task.error || '';
    this._onError(error, `Scheduler: task ${task.name} encountered an error ${message}`)
    this.stats.errors++;
    task.error = message;
    if (task.attempts <= task.retries) {
        console.log(`Scheduler: retry again later`);
        this.queue.push(task);
    } else {
        this.stats.exceededRetries++;
        console.log(`Scheduler: task ${task.name} exceeded retries`);
        console.log(task);
    }
    this.restart();
};

Scheduler.prototype.stop = function() {
    console.log("Scheduler: stop");
    this.currentTask = null;
    clearTimeout(this._timer);
    this._timer = null;
};

Scheduler.prototype.restart = function(empty) {
    console.log("Scheduler: restart");
    this.stop();
    if (empty) {
        this.queue = [];
    }
    this.startWithDelay(this.options.delayBetweenTasks);
};

Scheduler.prototype.add = function(fnAction, name, retries) {
    console.log("Scheduler: add");
    this.queue.push({ 
        added: Date.now(),
        name: (name || '').trim() || uuid.generate(),
        action: fnAction || function(complete, error) { complete(); },
        retries: Math.max(retries || 1),
        attempts: 0
    });
    this.stats.added++;
    this.start();
};

Scheduler.prototype.remove = function(fnAction, name) {
    console.log("Scheduler: remove");
    let lengthBefore = this.queue.length;
    this.queue = this.queue.filter(function(each) { 
        return each.action !== fnAction && each.name != name; 
    });
    let lengthAfter = this.queue.length;
    this.stats.removed = this.stats.removed + (lengthAfter - lengthBefore);
    this.start();
};

Scheduler.prototype._onError = function(error, message) {
    console.log(`[ERROR] ${message}`);
    console.log(error);
};
