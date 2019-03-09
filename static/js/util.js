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
		if (params) {
			formattedParams = formatParams(params);
		}
	}
	let request = new XMLHttpRequest();
	request.open(method, url + formattedParams, true);
	request.setRequestHeader('Content-type', 'application/json');
	request.setRequestHeader('Accept', 'application/json');
	if (headers) {
		for (let key in headers) {
			request.setRequestHeader(key, headers[key]);
		}
	}
	request.addEventListener('load', () => {
		if (request.status === 200 || request.status === 201) {
			success(JSON.parse(request.responseText));
		} else {
			error(request.responseText);
		}
	}, false);
	if (params) {
		request.send(JSON.stringify(params));
	} else {
		request.send(null);
	}
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
			return c.substring(nameEQ.length, c.length);
		}
	}
	return null;
};

let eraseCookie = (name) => {
	document.cookie = name+'=; Max-Age=-1;';
};

let userIsAuthenticated = (success, failed) => {
	sendAjax({
		method: 'POST',
		url: '/api/token/verify',
		success: (data) => {
			success(data);
		},
		error: (data) => {
			eraseCookie('auth_token');
			failed(data);
		}
	});
};

let appendPages = (pages, pagesContainer, container, eventListener) => {
	for (let i = 0; i < pages; i++) {
		let button = document.createElement('button');
		button.className = 'page-link';
		button.appendChild(document.createTextNode(i + 1));
		button.addEventListener('click', function () {
			eventListener(i + 1, container, pagesContainer);
		});
		let li = document.createElement('li');
		li.className = 'page-item';
		li.appendChild(button);
		pagesContainer.appendChild(li);
	}
};

let appendNoDataMessage = (root, message) => {
	let listEmpty = document.createElement('h4');
	listEmpty.style.textAlign = 'center';
	listEmpty.style.marginTop = '10px';
	listEmpty.className = 'text-muted';
	listEmpty.appendChild(document.createTextNode(message));
	root.innerHTML = '';
	root.appendChild(listEmpty);
};

let refreshData = (data, container, createFunction, currPage, moreBtn, root, dataName) => {
	if (data[dataName].length > 0) {
		for (let i = 0; i < data[dataName].length; i++) {
			container.appendChild(createFunction(data[dataName][i]));
		}
		if (parseInt(data['pages']) <= currPage && moreBtn != null) {
			moreBtn.disabled = true;
		}
	} else {
		appendNoDataMessage(root, 'No ' + dataName);
	}
};

let loadPage = (url, limit, page, container, createFn, moreBtn, root, dataName) => {
	sendAjax({
		method: 'GET',
		url: url,
		params: {
			page: page,
			limit: limit
		},
		success: (data) => {
			refreshData(data, container, createFn, page, moreBtn, root, dataName);
		},
		error: (data) => {
			alert(data);
		}
	});
};

export default {
	sendAjax: sendAjax,
	setCookie: setCookie,
	getCookie: getCookie,
	eraseCookie: eraseCookie,
	userIsAuthenticated: userIsAuthenticated,
	appendPages: appendPages,
	appendNoDataMessage: appendNoDataMessage,
	refreshData: refreshData,
	loadPage: loadPage
};
