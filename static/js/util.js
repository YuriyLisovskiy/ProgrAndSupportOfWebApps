let sendAjax = ({method, url, params, success, error}) => {
	let formatParams = (params) => {
		return '?' + Object
			.keys(params)
			.map(function(key){
				return key+'=' + encodeURIComponent(params[key])
			})
			.join('&')
	};
	method = method.toLowerCase();
	let formattedParams = '';
	if (method === 'get') {
		formattedParams = formatParams(params);
	}
	let request = new XMLHttpRequest();
	request.open(method, url + formattedParams, true);
	request.setRequestHeader('Content-type', 'application/json');
	request.onreadystatechange = () => {
		if (request.readyState === 4) {
			if (request.status === 200) {
				success(JSON.parse(request.responseText));
			} else {
				error(request.status);
			}
		}
	};
	request.send(JSON.stringify(params));
};

let setCookie = (name, value, days) => {
	let expires = "";
	if (days) {
		let date = new Date();
		date.setTime(date.getTime() + (days*24*60*60*1000));
		expires = "; expires=" + date.toUTCString();
	}
	document.cookie = name + "=" + (value || "")  + expires + "; path=/";
};

let getCookie = (name) => {
	let nameEQ = name + "=";
	let ca = document.cookie.split(';');
	for (let i=0;i < ca.length;i++) {
		let c = ca[i];
		while (c.charAt(0) === ' ') {
			c = c.substring(1,c.length);
		}
		if (c.indexOf(nameEQ) === 0) {
			return c.substring(nameEQ.length,c.length);
		}
	}
	return null;
};

let eraseCookie = (name) => {
	document.cookie = name+'=; Max-Age=-99999999;';
};

export default {
	sendAjax: sendAjax,
	setCookie: setCookie,
	getCookie: getCookie,
	eraseCookie: eraseCookie
};
