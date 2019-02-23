let sendAjax = ({method, url, params, headers, success, error}) => {
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
	if (headers) {
		for (let key in headers) {
			request.setRequestHeader(key, headers[key]);
		}
	}
	request.onreadystatechange = () => {
		if (request.readyState === 4) {
			if (request.status === 200 || request.status === 201) {
				success(JSON.parse(request.responseText));
			} else {
				error(request.responseText);
			}
		}
	};
	request.send(JSON.stringify(params));
};

let setCookie = (name, value, hours) => {
	let expires = "";
	if (hours) {
		let date = new Date();
		date.setTime(date.getTime() + (hours * 60 * 60 * 1000));
		expires = "; expires=" + date.toUTCString();
	}
	document.cookie = name + "=" + (value || "")  + expires + "; path=/";
};

let getCookie = (name) => {
	let nameEQ = name + "=";
	let ca = document.cookie.split(';');
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) === ' ') {
			c = c.substring(1, c.length);
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

let userIsAuthenticated = (success, failed) => {
	let token = getCookie('auth_token');
	if (token) {
		sendAjax({
			method: 'POST',
			url: '/api/token/verify',
			headers: {
				authorization: 'Token ' + token
			},
			success: (data) => {
				success(data);
			},
			error: (data) => {
				eraseCookie('auth_token');
				failed(data);
			}
		});
	} else {
		failed();
	}
};

export default {
	sendAjax: sendAjax,
	setCookie: setCookie,
	getCookie: getCookie,
	eraseCookie: eraseCookie,
	userIsAuthenticated: userIsAuthenticated
};
