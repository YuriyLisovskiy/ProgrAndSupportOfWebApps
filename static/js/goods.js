import sendAjax from './util.js'

let createGoodsItem = (item) => {
	let div = document.createElement('div');
	let name = document.createElement('p');
	name.appendChild(document.createTextNode(item['name']));
	div.appendChild(name);
	let price = document.createElement('p');
	price.appendChild(document.createTextNode(item['price']));
	div.appendChild(price);
	return div;
};

let updateGoods = (data) => {
	let ul = document.getElementById('goods');
	let pages = document.getElementById('pages');
	ul.innerHTML = '';
	pages.innerHTML = '';
	for (let i = 0; i < data['pages']; i++) {
		let button = document.createElement('button');
		button.appendChild(document.createTextNode(i + 1));
		button.addEventListener('click', function () {
			getGoods(i + 1);
		});
		pages.appendChild(button);
	}
	for (let i in data['goods']) {
		let li = document.createElement('li');
		li.appendChild(createGoodsItem(data['goods'][i]));
		ul.appendChild(li);
	}
};

let getGoods = (page) => {
	sendAjax({
		method: 'GET',
		url: '/api/goods',
		params: {
			page: page
		},
		success: (data) => {
			updateGoods(data);
		},
		error: (data) => {
			alert(data);
		}
	});
};

document.onreadystatechange = () => {
	if (document.readyState === 'complete') {
		getGoods(1);
	}
};
