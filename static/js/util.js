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

export default sendAjax;
