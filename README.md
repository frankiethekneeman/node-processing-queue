# A queue for external processing by Node JS

## Usage

    var ProcessingQueue = require('processing-queue');

    var queue = new ProcessingQueue(options);

### Options

Options

All of these options can be modified after intitalization by setting them in the `queue.opts` object.

So, for instance:

    queue.opts.basename

or, to reset an option back to its default:

    delete queue.opts.progress;

## Methods

### queue.push(payload)

Push a new job to the front of the queue.
Returns true if the job is added, false otherwise.

### queue.append(payload)

Append to the back of the queue.
Returns true if the job is added, false otherwise.

### queue.size()

Returns the number of objects waiting in the queue.

### queue.workers()

Returns the number of active workers.

### queue.start()

Start the queue.

### queue.stop()

Stop the queue.  This does not cancel working workers - it just ceases the creation of new workers.

## Contributing

Please maintain the existing style - but do open a pull request if you have a bugfix or a cool feature.
Be sure to document your change.  Pull requests are preferred to bug reports (though if you submit a bug
report, you're welcome to fix your own bug).

Please be sure to update all documentation to reflect your changes - add to the Readme files and the in
code commenting.
