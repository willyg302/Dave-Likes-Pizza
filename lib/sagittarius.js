function createCORSRequest() {
	var xhr = new XMLHttpRequest();
	if ("withCredentials" in xhr) {
		// We're good!
	} else if (typeof XDomainRequest != "undefined") {
		xhr = new XDomainRequest();
	} else {
		xhr = null;
	}
	return xhr;
}

function Sagittarius(appid, pass) {
	this.appid = appid;
	this.pass = pass;
}

Sagittarius.prototype.post = function(dest, data, callback) {
	var request = createCORSRequest();
	if (!request) {
		return;
	}
	if (window.XDomainRequest) {
		request.onload = function() {
			callback(request.responseText);
		};
	} else {
		request.onreadystatechange = function(response) {
			if (request.readyState == 4) {
				callback(request.responseText);
			}
		};
	}
	request.open('POST', "http://" + this.appid + ".appspot.com" + dest + "?" + data, true);
	request.send();
};

Sagittarius.prototype.GetLeaderboard = function(getObj) {
	var data = 'act=get';
	if (getObj.hasOwnProperty('name')) {
		data += ('&n=' + getObj.name);
	}
	if (getObj.hasOwnProperty('limit')) {
		data += ('&rlim=' + getObj.limit);
	}
	if (getObj.hasOwnProperty('offset')) {
		data += ('&roff=' + getObj.offset);
	}
	this.post('/ldbds', data, getObj.callback);
};

Sagittarius.prototype.PostToLeaderboard = function(postObj) {
	var data = "act=post&score=" + postObj.score + "&sid=" + postObj.scoreid;
	if (postObj.hasOwnProperty('name')) {
		data += ('&n=' + postObj.name);
	}
	this.post('/ldbds', data, postObj.callback);
}