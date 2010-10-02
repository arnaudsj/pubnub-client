/*

© 2010 by Limey Frog LLC

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

exports.PUBNUB = function (SUBSCRIBE_KEY, PUBLISH_KEY, HOST, PORT)
{
		this.VERSION = '0.1.0';
		this.SUBSCRIBE_KEY = SUBSCRIBE_KEY;
		this.PUBLISH_KEY = PUBLISH_KEY;
		this.HOST = HOST || 'pubnub-prod.appspot.com';
		this.PORT = PORT || '80';
		this.USER_AGENT = "node-pubnub-client/"+this.VERSION;
		
		this.channels = {};
		
		var NOW = 1;
		var now = function() {
			return (NOW++) + '' + (+new Date);
		};

		// Time API Call
		/*
		PUBNUB.time(function(time) {
			console.log(time);
		});
		*/
		this.time = function( callback )
		{
			var httpClient = require('http').createClient(this.PORT, this.HOST); 
			var uri = "/pubnub-time";

			var httpRequest = httpClient.request(
				"GET",
				uri,
				{"host": this.HOST, "User-Agent": this.USER_AGENT}
			);
			
			httpRequest.addListener('response', function (response) 
			{
				var responseBody = [];
				response.addListener("end", function()
				{
					// Parse response (we don't need the window object)
					var responseBodyString = responseBody.join("").replace(/window\[""\]\(/gi, "").slice(0,-1);
					if (typeof callback !=='undefined')
					{
						//console.log(responseBodyString);
						callback(JSON.parse(responseBodyString));
					}
				});

				response.addListener("data", function (chunk)
				{
					responseBody.push(chunk);
				});
			});		   
			httpRequest.end();
		};


		/*
			// UUID API Call
			PUBNUB.uuid(function(uuid) {
				console.log(uuid);
			});
		*/
		this.uuid = function( callback )
		{
			var httpClient = require('http').createClient(this.PORT, this.HOST); 
			var uri = "/pubnub-uuid";

			var httpRequest = httpClient.request(
				"GET",
				uri,
				{"host": this.HOST, "User-Agent": this.USER_AGENT}
			);
			
			httpRequest.addListener('response', function (response) 
			{
				var responseBody = [];
				response.addListener("end", function()
				{
					// Parse response (we don't need the window object)
					var responseBodyString = responseBody.join("").replace(/window\[""\]\(/gi, "").slice(0,-1);
					if (typeof callback !=='undefined')
					{
						//console.log(responseBodyString);
						callback(JSON.parse(responseBodyString));
					}
				});

				response.addListener("data", function (chunk)
				{
					responseBody.push(chunk);
				});
			});		   
			httpRequest.end();
		};


	
		this.publish = function (channel, message, callback)
		{
			var unique = 'x' + now();
			
			var httpClient = require('http').createClient(this.PORT, this.HOST); 
			var uri = "/pubnub-publish?channel=" + this.SUBSCRIBE_KEY +"/" + channel + "&message=" + JSON.stringify(message) +"&publish_key=" + this.PUBLISH_KEY + "&unique=" + unique;
			//console.log(uri);
			var httpRequest = httpClient.request(
				"GET",
				uri,
				{"host": this.HOST, "User-Agent": "node-pubnub-client/"+this.VERSION}
			);
			httpRequest.addListener('response', function (response) 
			{
				var responseBody = [];
				response.addListener("end", function()
				{
					// Parse response (we don't need the window object)
					var responseBodyString = responseBody.join("").replace(/window\["x[\d]+"\]\(/gi, "").slice(0,-1);
					if (typeof callback !=='undefined')
					{
						callback(JSON.parse(responseBodyString));
					}
				});

				response.addListener("data", function (chunk)
				{
					responseBody.push(chunk);
				});
			});		   
			httpRequest.end();
		};
		this.subscribe = function(channel, callback)
		{
			var that = this;
			var unique = 'x' + now();
			var httpClient = require('http').createClient(this.PORT, this.HOST); 
			var uri = "/pubnub-subscribe?channel=" + this.SUBSCRIBE_KEY +"/" + channel + "&unique=" + unique;
			//console.log(uri);

			var httpRequest = httpClient.request(
				"GET",
				uri,
				{"host": this.HOST, "User-Agent": "node-pubnub-client/"+this.VERSION}
			);

			// First response needs to be parsed to find out IP address of server we will be polling	
			// e.g => window["x41283311957898"]({"status": 200, "server": "184.72.51.46:8807"})
			httpRequest.addListener('response', function (response) 
			{
				var responseBody = [];
				response.addListener("end", function()
				{
					// Parse response (we don't need the window object)
					var responseBodyString = responseBody.join("").replace(/window\["x[\d]+"\]\(/gi, "").slice(0,-1);
					var responseObject = JSON.parse(responseBodyString);
					if (responseObject.status === 200)
					{
						that.channels[channel] = {status: 1, response: false};
						that.poll(responseObject.server, channel, 0, callback);
					}
					else
					{
						// throw an error!!
					}
				   
				});

				response.addListener("data", function (chunk)
				{
					responseBody.push(chunk);
				});
			});		   
			httpRequest.end();
		};
		
		 //	 enter the continous polling (e.g http://184.72.51.46:8807/?channel=752a4eb0-b502-11df-a256-2f52a4db9804/demo&timetoken=1283312010272&unique=x81283312010431)
		this.poll = function(host, channel, timetoken, callback)
		{
			var that = this;
			var pollhp = host.split(':');
			
			var unique = 'x' + now();
			var httpClient = require('http').createClient(pollhp[1], pollhp[0]); 
			var uri = "/?channel=" + this.SUBSCRIBE_KEY +"/" + channel + "&timetoken="+ timetoken + "&unique=" + unique;
			//console.log(uri);

			var httpRequest = httpClient.request(
				"GET",
				uri,
				{"host": pollhp[0], "User-Agent": "nodejs/0.2"}
			);		   

			// Parse something like:
			// window["x1311283315208324"]({"messages":["xdr.timeout"],"timetoken":1283315234205})

			httpRequest.addListener('response', function (response) 
			{
				var responseBody = [];
				if (typeof that.channels[channel] !== 'undefined' 
					&& that.channels[channel].status === 1)
				{
					that.channels[channel].response = httpRequest;
				} 
				response.addListener("end", function()
				{
					if (responseBody.length > 0)
					{
						// Parse response (we don't need the window object)
						var responseBodyString = responseBody.join("").replace(/window\["x[\d]+"\]\(/gi, "").slice(0,-1);
						var responseObject = JSON.parse(responseBodyString);
						if (responseObject.messages[0] !== 'xdr.timeout')
						{
							callback(responseObject.messages);
						}
						if (typeof that.channels[channel] !== 'undefined' && that.channels[channel].status === 1)
						{
							that.poll(host, channel, responseObject.timetoken, callback);
						}
					}
				});

				response.addListener("data", function (chunk)
				{
					responseBody.push(chunk);
				});
			});		   
			//httpRequest.connection.setTimeout(5000);
			httpRequest.end();
		};
		
		this.unsubscribe = function (channel)
		{
			this.channels[channel].response.connection;
			delete this.channels[channel];
		};
		
		this.history = function ( options, callback )
		{
			return "Not Implemented";
		}
		
	return this;

}
