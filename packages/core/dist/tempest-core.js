(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.tempestCore = global.tempestCore || {})));
}(this, function (exports) { 'use strict';

	function symbolObservablePonyfill(root) {
		var result;
		var Symbol = root.Symbol;

		if (typeof Symbol === 'function') {
			if (Symbol.observable) {
				result = Symbol.observable;
			} else {
				result = Symbol('observable');
				Symbol.observable = result;
			}
		} else {
			result = '@@observable';
		}

		return result;
	};

	var root = undefined;
	if (typeof global !== 'undefined') {
		root = global;
	} else if (typeof window !== 'undefined') {
		root = window;
	}

	var result = symbolObservablePonyfill(root);

	// append :: a -> [a] -> [a]
	// a with x appended
	function append(x, a) {
	    var l = a.length;
	    var b = new Array(l + 1);
	    for (var i = 0; i < l; ++i) {
	        b[i] = a[i];
	    }
	    b[l] = x;
	    return b;
	}
	// remove :: Int -> [a] -> [a]
	// remove element at index
	function remove(i, a) {
	    if (i < 0) {
	        throw new TypeError('i must be >= 0');
	    }
	    var l = a.length;
	    if (l === 0 || i >= l) {
	        return a;
	    }
	    if (l === 1) {
	        return [];
	    }
	    return unsafeRemove(i, a, l - 1);
	}
	// unsafeRemove :: Int -> [a] -> Int -> [a]
	// Internal helper to remove element at index
	function unsafeRemove(i, a, l) {
	    var b = new Array(l);
	    var j;
	    for (j = 0; j < i; ++j) {
	        b[j] = a[j];
	    }
	    for (j = i; j < l; ++j) {
	        b[j] = a[j + 1];
	    }
	    return b;
	}
	// removeAll :: (a -> boolean) -> [a] -> [a]
	// remove all elements matching a predicate
	function removeAll(f, a) {
	    var l = a.length;
	    var b = new Array(l);
	    var j = 0;
	    for (var x, i = 0; i < l; ++i) {
	        x = a[i];
	        if (!f(x)) {
	            b[j] = x;
	            ++j;
	        }
	    }
	    b.length = j;
	    return b;
	}
	// findIndex :: a -> [a] -> Int
	// find index of x in a, from the left
	function findIndex(x, a) {
	    for (var i = 0, l = a.length; i < l; ++i) {
	        if (x === a[i]) {
	            return i;
	        }
	    }
	    return -1;
	}
	// isArrayLike :: * -> boolean
	// Return true iff x is array-like
	function isArrayLike(x) {
	    return x != null && typeof x.length === 'number' && typeof x !== 'function';
	}

	function tryEvent(time, value, sink) {
	    try {
	        sink.event(time, value);
	    }
	    catch (e) {
	        sink.error(time, e);
	    }
	}
	function tryEnd(time, value, sink) {
	    try {
	        sink.end(time, value);
	    }
	    catch (e) {
	        sink.error(time, e);
	    }
	}
	var None = function None () {};

	None.prototype.event = function event (t, x) { return void 0; };
	None.prototype.end = function end (t, x) { return void 0; };
	None.prototype.error = function error (t, x) { return void 0; };
	var NONE$1 = new None();
	function none() {
	    return NONE$1;
	}
	function removeManyAt(i, sinks) {
	    var updated = remove(i, sinks);
	    // It's impossible to create a Many with 1 sink
	    // so we can't end up with updated.length === 0 here
	    return updated.length === 1 ? updated[0]
	        : new Many(updated);
	}
	function removeMany(sink, many) {
	    var sinks = many.sinks;
	    var i = findIndex(sink, sinks);
	    return i < 0 ? many : removeManyAt(i, sinks);
	}
	function addSink(sink, sinks) {
	    return sinks === NONE$1 ? sink
	        : sinks instanceof Many ? new Many(append(sink, sinks.sinks))
	            : new Many([sinks, sink]);
	}
	function removeSink(sink, sinks) {
	    return sinks === NONE$1 || sink === sinks ? NONE$1
	        : sinks instanceof Many ? removeMany(sink, sinks)
	            : sinks;
	}
	var Many = function Many(sinks) {
	    this.sinks = sinks;
	};
	Many.prototype.event = function event (t, x) {
	    var s = this.sinks;
	    for (var i = 0; i < s.length; ++i) {
	        tryEvent(t, x, s[i]);
	    }
	};
	Many.prototype.end = function end (t, x) {
	    var s = this.sinks;
	    for (var i = 0; i < s.length; ++i) {
	        tryEnd(t, x, s[i]);
	    }
	};
	Many.prototype.error = function error (t, x) {
	    var s = this.sinks;
	    for (var i = 0; i < s.length; ++i) {
	        s[i].error(t, x);
	    }
	};

	var MulticastTask = function MulticastTask(run) {
	    this._run = run;
	    this.active = true;
	};
	MulticastTask.create = function create (run) {
	    return new MulticastTask(run);
	};
	MulticastTask.prototype.run = function run (time) {
	    if (!this.active)
	        return;
	    this._run();
	};
	MulticastTask.prototype.error = function error (time, err) {
	    return void 0;
	};
	MulticastTask.prototype.dispose = function dispose () {
	    this.active = false;
	};

	var MulticastDisposable = function MulticastDisposable(source, sink, scheduler) {
	    this.source = source;
	    this.sink = sink;
	    this.scheduler = scheduler;
	    this.disposed = false;
	};
	MulticastDisposable.prototype.dispose = function dispose () {
	    if (this.disposed)
	        return;
	    this.disposed = true;
	    var source = this.source;
	    var remaining = source._remove(this.sink);
	    if (remaining === 0) {
	        var task = MulticastTask.create(function () { return source._dispose(); });
	        source._stopId = this.scheduler.asap(task);
	    }
	};

	var EMPTY = { dispose: function dispose$1() { return void 0; } };
	var NONE = null;
	var Multicast = function Multicast(source) {
	    this.activeCount = 0;
	    this.source = source;
	    this.sink = none();
	    this.disposable = EMPTY;
	    this._stopId = NONE;
	};
	Multicast.prototype.run = function run (sink, scheduler) {
	    var n = this._add(sink);
	    if (n === 1) {
	        if (this._stopId !== NONE) {
	            scheduler.cancel(this._stopId);
	            this._stopId = NONE;
	        }
	        if (this.disposable === EMPTY) {
	            this.disposable = this.source.run(this, scheduler);
	        }
	    }
	    return new MulticastDisposable(this, sink, scheduler);
	};
	Multicast.prototype._dispose = function _dispose () {
	    var disposable = this.disposable;
	    this.disposable = EMPTY;
	    this._stopId = NONE;
	    Promise.resolve(disposable).then(dispose);
	};
	Multicast.prototype._add = function _add (sink) {
	    this.sink = addSink(sink, this.sink);
	    this.activeCount += 1;
	    return this.activeCount;
	};
	Multicast.prototype._remove = function _remove (sink) {
	    var s = this.sink;
	    this.sink = removeSink(sink, this.sink);
	    if (s !== this.sink) {
	        this.activeCount -= 1;
	    }
	    return this.activeCount;
	};
	Multicast.prototype.event = function event (time, value) {
	    this.sink.event(time, value);
	};
	Multicast.prototype.end = function end (time, value) {
	    this.sink.end(time, value);
	};
	Multicast.prototype.error = function error (time, err) {
	    this.sink.error(time, err);
	};
	function dispose(disposable) {
	    disposable.dispose();
	}

	var PredeterminedTask = function PredeterminedTask(delay, period, task, scheduler) {
	    this.time = delay;
	    this.period = period;
	    this.task = task;
	    this.scheduler = scheduler;
	    this.active = true;
	};
	PredeterminedTask.prototype.run = function run () {
	    this.task.run(this.time);
	};
	PredeterminedTask.prototype.error = function error (err) {
	    this.task.error(this.time, err);
	};
	PredeterminedTask.prototype.dispose = function dispose () {
	    this.scheduler.cancel(this);
	    return this.task.dispose();
	};

	function defer(task) {
	    return Promise.resolve(task).then(runTask);
	}
	function runTask(task) {
	    try {
	        return task.run(Date.now());
	    }
	    catch (e) {
	        return task.error(Date.now(), e);
	    }
	}
	function runScheduledTask(task) {
	    try {
	        task.run();
	    }
	    catch (e) {
	        task.error(e);
	    }
	}

	var TaskScheduler = function TaskScheduler(timer, timeline) {
	    this.timer = timer;
	    this.timeline = timeline;
	    this._timer = null;
	    this._nextArrival = Infinity;
	    var self = this;
	    this._runReadyTasksBound = function () { return self._runReadyTasks(self.now()); };
	};
	TaskScheduler.prototype.now = function now () {
	    return this.timer.now();
	};
	TaskScheduler.prototype.asap = function asap (task) {
	    return this.schedule(0, -1, task);
	};
	TaskScheduler.prototype.delay = function delay (delay, task) {
	    return this.schedule(delay, -1, task);
	};
	TaskScheduler.prototype.periodic = function periodic (period, task) {
	    return this.schedule(0, period, task);
	};
	TaskScheduler.prototype.schedule = function schedule (delay, period, task) {
	    var time = this.now();
	    var st = new PredeterminedTask(+(time) + Math.max(0, delay), period, task, this);
	    this.timeline.add(st);
	    this._scheduleNextRun(+(time));
	    return st;
	};
	TaskScheduler.prototype.cancel = function cancel (task) {
	    task.active = false;
	    if (this.timeline.remove(task)) {
	        this._reschedule();
	    }
	};
	TaskScheduler.prototype.cancelAll = function cancelAll (f) {
	    this.timeline.removeAll(f);
	    this._reschedule();
	};
	TaskScheduler.prototype._reschedule = function _reschedule () {
	    if (this.timeline.isEmpty()) {
	        this._unschedule();
	    }
	    else {
	        this._scheduleNextRun(this.now());
	    }
	};
	TaskScheduler.prototype._unschedule = function _unschedule () {
	    this.timer.clearTimer(this._timer);
	    this._timer = null;
	};
	TaskScheduler.prototype._scheduleNextRun = function _scheduleNextRun (time) {
	    if (this.timeline.isEmpty())
	        return;
	    var nextArrival = this.timeline.nextArrival();
	    if (this._timer === null) {
	        this._scheduleNextArrival(nextArrival, time);
	    }
	    else if (nextArrival < this._nextArrival) {
	        this._unschedule();
	        this._scheduleNextArrival(nextArrival, time);
	    }
	};
	TaskScheduler.prototype._scheduleNextArrival = function _scheduleNextArrival (nextArrival, time) {
	    this._nextArrival = nextArrival;
	    var delay = Math.max(0, nextArrival - time);
	    this._timer = this.timer.setTimer(this._runReadyTasksBound, delay);
	};
	TaskScheduler.prototype._runReadyTasks = function _runReadyTasks (time) {
	    this._timer = null;
	    this.timeline.runTasks(time, runScheduledTask);
	    this._scheduleNextRun(this.now());
	};

	var ClockTimer = function ClockTimer () {};

	ClockTimer.prototype.now = function now () {
	    return Date.now();
	};
	ClockTimer.prototype.setTimer = function setTimer (fn, delayTime) {
	    return delayTime <= 0
	        ? runAsTask(fn)
	        : setTimeout(fn, delayTime);
	};
	ClockTimer.prototype.clearTimer = function clearTimer (task) {
	    return task instanceof Asap
	        ? task.dispose()
	        : clearTimeout(task);
	};
	var Asap = function Asap(f) {
	    this.f = f;
	    this.active = true;
	};
	Asap.prototype.run = function run (time) {
	    if (this.active)
	        this.f();
	};
	Asap.prototype.error = function error (time, e) {
	    throw e;
	};
	Asap.prototype.dispose = function dispose () {
	    this.active = false;
	};
	function runAsTask(f) {
	    var task = new Asap(f);
	    defer(task);
	    return task;
	}

	var BinaryTimeline = function BinaryTimeline() {
	    this.tasks = [];
	};
	BinaryTimeline.prototype.nextArrival = function nextArrival () {
	    return this.isEmpty()
	        ? Infinity
	        : this.tasks[0].time;
	};
	BinaryTimeline.prototype.isEmpty = function isEmpty () {
	    return this.tasks.length === 0;
	};
	BinaryTimeline.prototype.add = function add (task) {
	    insertByTime(task, this.tasks);
	};
	BinaryTimeline.prototype.remove = function remove (task) {
	    var i = binarySearch(task.time, this.tasks);
	    if (i >= 0 && i < this.tasks.length) {
	        var at = findIndex(task, this.tasks[i].events);
	        if (at >= 0) {
	            this.tasks[i].events.splice(at, 1);
	            return true;
	        }
	    }
	    return false;
	};
	BinaryTimeline.prototype.removeAll = function removeAll$1 (f) {
	        var this$1 = this;

	    for (var i = 0, l = this.tasks.length; i < l; ++i) {
	        removeAllFrom(f, this$1.tasks[i]);
	    }
	};
	BinaryTimeline.prototype.runTasks = function runTasks$1 (time, runTask) {
	        var this$1 = this;

	    var tasks = this.tasks;
	    var l = tasks.length;
	    var i = 0;
	    while (i < l && tasks[i].time <= time) {
	        ++i;
	    }
	    this.tasks = tasks.slice(i);
	    for (var j = 0; j < i; ++j) {
	        this$1.tasks = runTasks(runTask, tasks[j], this$1.tasks);
	    }
	};
	function runTasks(runTask, timeslot, tasks) {
	    var events = timeslot.events;
	    for (var i = 0; i < events.length; ++i) {
	        var task = events[i];
	        if (task.active) {
	            runTask(task);
	            if (task.period >= 0 && task.active) {
	                task.time = task.time + task.period;
	                insertByTime(task, tasks);
	            }
	        }
	    }
	    return tasks;
	}
	function insertByTime(task, timeslots) {
	    var l = timeslots.length;
	    if (l === 0) {
	        timeslots.push(BinaryTimeslot.create(task.time, [task]));
	        return;
	    }
	    var i = binarySearch(task.time, timeslots);
	    if (i >= l) {
	        timeslots.push(BinaryTimeslot.create(task.time, [task]));
	    }
	    else if (task.time === timeslots[i].time) {
	        timeslots[i].events.push(task);
	    }
	    else {
	        timeslots.splice(i, 0, BinaryTimeslot.create(task.time, [task]));
	    }
	}
	function removeAllFrom(f, timeslot) {
	    timeslot.events = removeAll(f, timeslot.events);
	}
	function binarySearch(time, sortedArray) {
	    var lo = 0;
	    var hi = sortedArray.length;
	    var mid;
	    var y;
	    while (lo < hi) {
	        mid = Math.floor((lo + hi) / 2);
	        y = sortedArray[mid];
	        if (time === y.time) {
	            return mid;
	        }
	        else if (time < y.time) {
	            hi = mid;
	        }
	        else {
	            lo = mid + 1;
	        }
	        return hi;
	    }
	}
	var BinaryTimeslot = function BinaryTimeslot(time, events) {
	    this.time = time;
	    this.events = events;
	};
	BinaryTimeslot.create = function create (time, events) {
	    return new BinaryTimeslot(time, events);
	};

	var defaultScheduler = new TaskScheduler(new ClockTimer(), new BinaryTimeline());

	var BasicSubscription = function BasicSubscription(source, sink) {
	    this.source = source;
	    this.sink = sink;
	    this.disposable = source.run(sink, defaultScheduler);
	};
	BasicSubscription.create = function create (source, sink) {
	    return new BasicSubscription(source, sink);
	};
	BasicSubscription.prototype.unsubscribe = function unsubscribe () {
	    this.disposable.dispose();
	};

	var SubscriberSink = function SubscriberSink(_next, _error, _complete) {
	    this._next = _next;
	    this._error = _error;
	    this._complete = _complete;
	};
	SubscriberSink.create = function create (next, error, complete) {
	    return new SubscriberSink(next, error, complete);
	};
	SubscriberSink.prototype.event = function event (t, x) {
	    var ref = this;
	        var _next = ref._next;
	    _next(x);
	};
	SubscriberSink.prototype.error = function error (t, e) {
	    var ref = this;
	        var _error = ref._error;
	    _error(e);
	};
	SubscriberSink.prototype.end = function end (t, x) {
	    var ref = this;
	        var _complete = ref._complete;
	    _complete(x);
	};

	function fatalError(err) {
	    setTimeout(function () { throw err; }, 0);
	}

	var PropagateTask = function PropagateTask(run, value, sink) {
	    this._run = run;
	    this.value = value;
	    this.sink = sink;
	    this.active = true;
	};
	PropagateTask.event = function event$1 (value, sink) {
	    return new PropagateTask(event, value, sink);
	};
	PropagateTask.error = function error$1 (err, sink) {
	    return new PropagateTask(error, err, sink);
	};
	PropagateTask.end = function end$1 (value, sink) {
	    return new PropagateTask(end, value, sink);
	};
	PropagateTask.prototype.run = function run (time) {
	    if (!this.active)
	        return;
	    this._run(time, this.value, this.sink);
	};
	PropagateTask.prototype.error = function error$2 (time, err) {
	    if (!this.active)
	        fatalError(err);
	    this.active = false;
	    this.sink.error(time, err);
	};
	PropagateTask.prototype.dispose = function dispose () {
	    this.active = false;
	};
	function event(time, value, sink) {
	    sink.event(time, value);
	}
	function error(time, err, sink) {
	    sink.error(time, err);
	}
	function end(time, value, sink) {
	    sink.end(time, value);
	}

	var FromArraySource = function FromArraySource(array) {
	    this.array = array;
	};
	FromArraySource.prototype.run = function run (sink, scheduler) {
	    var task = scheduler.asap(new PropagateTask(runArrayTask(this.array, scheduler), void 0, sink));
	    return { dispose: function () { return task.dispose(); } };
	};
	function runArrayTask(array, scheduler) {
	    return function arrayTask(time, value, sink) {
	        array.forEach(function (x) { return sink.event(scheduler.now(), x); });
	        sink.end(scheduler.now(), void 0);
	    };
	}

	var FromObservableSource = function FromObservableSource(observable) {
	    this.observable = observable;
	};
	FromObservableSource.prototype.run = function run (sink, scheduler) {
	    var next = function (x) { return sink.event(scheduler.now(), x); };
	    var error = function (e) { return sink.error(scheduler.now(), e); };
	    var complete = function (x) { return sink.end(scheduler.now(), x); };
	    var subscription = this.observable.subscribe({ next: next, error: error, complete: complete });
	    return { dispose: function () { return subscription.unsubscribe(); } };
	};

	var Stream = function Stream(source) {
	    this.source = new Multicast(source);
	};
	Stream.from = function from (input) {
	    if (typeof input[result] === 'function') {
	        return new Stream(new FromObservableSource(input));
	    }
	    else if (isArrayLike(input)) {
	        return new Stream(new FromArraySource(input));
	    }
	    else {
	        throw new Error('Stream can only be made from an Observable or ArrayLike object');
	    }
	};
	Stream.of = function of () {
	        var items = [], len = arguments.length;
	        while ( len-- ) items[ len ] = arguments[ len ];

	    return Stream.from(items);
	};
	Stream.prototype.subscribe = function subscribe (nextOrSubscriber, error, complete) {
	    var _next = Function.prototype;
	    var _error = Function.prototype;
	    var _complete = Function.prototype;
	    if (nextOrSubscriber !== null && typeof nextOrSubscriber === 'object') {
	        var subscriber = nextOrSubscriber;
	        var next = subscriber.next;
	            var error$1 = subscriber.error;
	            var complete$1 = subscriber.complete;
	        if (next && typeof next === 'function')
	            _next = next;
	        if (error$1 && typeof error$1 === 'function')
	            _error = error$1;
	        if (complete$1 && typeof complete$1 === 'function')
	            _complete = complete$1;
	    }
	    else if (typeof nextOrSubscriber === 'function') {
	        _next = nextOrSubscriber;
	        if (error && typeof error === 'function')
	            _error = error;
	        if (complete && typeof complete === 'function')
	            _complete = complete;
	    }
	    return BasicSubscription.create(this.source, SubscriberSink.create(_next, _error, _complete));
	};
	Stream.prototype[result] = function () {
	    return this;
	};

	function withDefaultScheduler(f, source) {
	    return withScheduler(f, source, defaultScheduler);
	}
	function withScheduler(f, source, scheduler) {
	    return new Promise(function (resolve, reject) {
	        runSource(f, source, scheduler, resolve, reject);
	    });
	}
	function runSource(f, source, scheduler, end, error) {
	    var disposable = new SettableDisposable();
	    var observer = new Drain(f, end, error, disposable);
	    disposable.setDisposable(source.run(observer, scheduler));
	}
	var SettableDisposable = function SettableDisposable() {
	    this.disposable = void 0;
	    this.disposed = false;
	    this._resolve = void 0;
	    var self = this;
	    this._result = new Promise(function (resolve) {
	        self._resolve = resolve;
	    });
	};
	SettableDisposable.prototype.dispose = function dispose () {
	    if (this.disposed)
	        return this._result;
	    this.disposed = true;
	    if (this.disposable) {
	        this._result = this.disposable.dispose();
	    }
	    return this._result;
	};
	SettableDisposable.prototype.setDisposable = function setDisposable (disposable) {
	    if (this.disposable !== void 0) {
	        throw new Error('Disposable can only be set one time');
	    }
	    this.disposable = disposable;
	    if (this.disposed) {
	        this._resolve(disposable.dispose());
	    }
	};
	var Drain = function Drain(_event, _end, _error, disposable) {
	    this._event = _event;
	    this._end = _end;
	    this._error = _error;
	    this.disposable = disposable;
	    this.active = true;
	};
	Drain.prototype.event = function event (time, value) {
	    if (!this.active)
	        return;
	    this._event(value);
	};
	Drain.prototype.error = function error (time, err) {
	    if (!this.active)
	        return;
	    this.active = false;
	    disposeThen(this._error, this._error, this.disposable, err);
	};
	Drain.prototype.end = function end (time, value) {
	    if (!this.active)
	        return;
	    this.active = false;
	    disposeThen(this._error, this._error, this.disposable, value);
	};
	function disposeThen(end, error, disposable, value) {
	    Promise.resolve(disposable.dispose()).then(function () {
	        end(value);
	    }, error);
	}

	function getSource(stream) {
	    return stream.source instanceof Multicast
	        ? stream.source.source
	        : stream.source;
	}

	var IndexSink = function IndexSink(index, sink) {
	    this.index = index;
	    this.sink = sink;
	    this.active = true;
	    this.value = void 0;
	};
	IndexSink.prototype.event = function event (time, value) {
	    if (!this.active)
	        return;
	    this.value = value;
	    this.sink.event(time, { index: this.index, value: this.value });
	};
	IndexSink.prototype.error = function error (time, err) {
	    this.sink.error(time, err);
	};
	IndexSink.prototype.end = function end (time, value) {
	    if (!this.active)
	        return;
	    this.active = false;
	    this.sink.end(time, { index: this.index, value: value });
	};

	/**
	 * Takes a function with 1 argument and returns a curried version of it
	 *
	 * @export
	 * @template A
	 * @template B
	 * @param {(a: A) => B} f
	 * @returns {OneMore<A, B>}
	 */
	function curry1(f) {
	    function curried(a) {
	        switch (arguments.length) {
	            case 0: return curried;
	            case 1: return f(a);
	            default: return curried;
	        }
	    }
	    return curried;
	}
	/**
	 * Takes a function with 2 arguments and returns a curried version of it
	 *
	 * @export
	 * @template A
	 * @template B
	 * @template C
	 * @param {(a: A, b: B) => C} f
	 * @returns {TwoMore<A, B, C>}
	 */
	function curry2(f) {
	    function curried(a, b) {
	        switch (arguments.length) {
	            case 0: return curried;
	            case 1: return curry1(function (b) { return f(a, b); });
	            case 2: return f(a, b);
	            default: return curried;
	        }
	    }
	    return curried;
	}
	/**
	 * Takes a function with 3 arguments and returns a curried version
	 *
	 * @export
	 * @template A
	 * @template B
	 * @template C
	 * @template D
	 * @param {(a: A, b: B, c: C) => D} f
	 * @returns {ThreeMore<A, B, C, D>}
	 */
	function curry3(f) {
	    function curried(a, b, c) {
	        switch (arguments.length) {
	            case 0: return curried;
	            case 1: return curry2(function (b, c) { return f(a, b, c); });
	            case 2: return curry1(function (c) { return f(a, b, c); });
	            case 3: return f(a, b, c);
	            default: return curried;
	        }
	    }
	    return curried;
	}

	exports.Stream = Stream;
	exports.defaultScheduler = defaultScheduler;
	exports.PropagateTask = PropagateTask;
	exports.runSource = runSource;
	exports.withScheduler = withScheduler;
	exports.withDefaultScheduler = withDefaultScheduler;
	exports.getSource = getSource;
	exports.BasicSubscription = BasicSubscription;
	exports.SubscriberSink = SubscriberSink;
	exports.IndexSink = IndexSink;
	exports.Multicast = Multicast;
	exports.curry1 = curry1;
	exports.curry2 = curry2;
	exports.curry3 = curry3;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=tempest-core.js.map
