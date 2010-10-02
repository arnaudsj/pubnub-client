# Pubnub client for Node.js

## In a nutshell

- Talk to PubNub API from Node.js 


## Synopsis

When lib in installed via [npm]():

    var PUBNUB = new require('pubnub-client').PUBNUB("demo", "demo");
    PUBNUB.publish('demo', {'testing': '1,2,3,4,5'}, function(response)
	{
		if (response.status === 200) console.log('Message published successfully!');
	});

- Refer to the many tests in `test/pubnub.js` for basic usage examples.

## Installation

This version requires at least `Node.js v0.2.0`.

Tested with Node.js `v0.2.0`.

You have a number of choices:

- git clone this repo or download a tarball and simply copy `lib/pubnub-client.js` into your project
- use git submodule
- use the [npm]() package manager for Node.js

## Running the tests

A good way to learn about this client is to read the test code.

To run the tests, install vows and run the tests by typing `vows` at the top level.

	$ vows
	······ ······ 
	✓ OK » 12 honored (3.019s)

## Documentation

If you feel that more needs to be added, please let me know and I will do my best to provide more details. PubNub JS browser client lib is a good start though to help you understand the basics.


