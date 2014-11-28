var LimitingQueue = require('limiting-queue')

/**
 *  Here is where I will document the default values for the various arguments to be passed into this constructor.
 */
var defaults = {

        /**
         *  The function to call to do work on a queue entry.
         *  
         *  @param args The arguments passed to the function.
         *  @param previousAttempts the number of times this payload has previously been pushed to this function.
         *  @param deferred The deferred object to declare success or failure on the queue item.
         *  @param result The result of the external process - JSON decoded, if possible.
         *  
         *  @return (Optional) a function to be called in case of a timeout (to do any necessary cleanup).
         */
        callback: function(args, previousAttempts, result, deferred){deferred.fulfill()}

        /**
         *  The program to call
         */
        , program: ':'

    }   
    ;

module.exports = function ProcessingQueue(opts) {
    this.opts = opts;
    var queue = new LimitingQueue({
        autoStart: this.opts.autoStart
        callback: function(payload, previousAttempts, deferred) {
            var retVal = '';
            var child = child_process.spawn(this.opts.program, payload)
            child.stdout.on('data', function(chunk) {
                retVal += chunk;
            }).on('end', function() {
                try {
                    try {
                        retVal = JSON.parse(retVal);
                    } catch (err) {
                        //No need to worry, just a bad JSON.parse...
                    }
                    this.opts.callback(payload, previousAttempts, retVal, deferred);
                } catch (e) {
                    console.log(e, e.stack, retVal);
                    deferred.reject(e);
                }
            }.bind(this));
            return function() {
                var kill = setTimeout(function() {
                    child.kill('SIGKILL');
                }, queue.opts.maxWait);
                child.on('close', function(code, signal) {
                    clearTimeout(kill);
                });
                child.kill('SIGTERM');
            }.bind(this);
        }.bind(this)
    });

    this.opts.__proto__ = defaults;
    defaults.__proto__ = queue.opts.__proto__;
    queue.opts.__proto__ = this.opts;
    delete queue.opts.autoStart;

    /**
     *  Generalized private function to abstract payload to string argument conversion.
     *  
     *  @param payload the payload to be (eventually) delivered back to the
     *    workers.
     *  @param addAction the name of the function to be use on the queue Object.
     *  
     *  @return true if the payload is added, false otherwise.
     */
    var addPayload = function(payload, addAction) {
        if (! Array.isArray(payload))
            payload = [payload];
        payload = payload.map(function(element, index, array) {
            if (typeof element !== "string")
                return JSON.stringify(element);
            return element;
        });
        return queue[addAction](payload);
    }.bind(this)//addPayload(payload, addAction)

    /**
     *  Push to the front of the queue.
     *  
     *  @param payload The data to eventually be delivered back.
     *  
     *  @return true if the payload is added, false otherwise.
     */
    this.push = function(payload) {
        return addPayload(payload, 'push');
    }.bind(this)//push(payload)

    /**
     *  Append to the back of the queue.
     *  
     *  @param payload The data to eventually be delivered back.
     *  
     *  @return true if the payload is added, false otherwise.
     */
    this.append = function(payload) {
        return addPayload(payload, 'append');
    }.bind(this)//append(payload)

    /**
     *  Check the size of the queue.
     *  
     *  @return the number of objects waiting in the queue.
     */
    this.size = function() {
        return queue.size();
    }.bind(this)//size()

    /**
     *  Check how many workers are currently doing work.
     *  
     *  @return the number of active workers.
     */
    this.workers = function() {
        return queue.workers();
    }.bind(this)//workers()

    /**
     *  Start the queue.
     */
    this.start = function() {
        return queue.start();
    }.bind(this)//start()

    /**
     *  Stop the queue.  This does not cancel working workers - it just ceases the creation of new workers.
     */
    this.stop = function() {
        return queue.stop();
    }.bind(this)//stop()
};
