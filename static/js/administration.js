import util from '/static/js/util.js';

let createTableRow = (item, container, pages) => {
	let title = document.createElement('th');
	title.appendChild(document.createTextNode(item['title']));

	let price = document.createElement('th');
	price.appendChild(document.createTextNode('$ ' + item['price']));

	let description = document.createElement('th');
	description.className = 'text-truncate';
	description.appendChild(document.createTextNode(item['description']));

	let btnDelete = document.createElement('button');
	btnDelete.className = 'btn btn-danger';
	btnDelete.type = 'button';
	btnDelete.appendChild(document.createTextNode('Delete'));
	btnDelete.addEventListener('click', () => {
		util.sendAjax({
			method: 'POST',
			url: '/api/goods',
			params: {
				goods_code: item['code']
			},
			success: () => {
				loadGoods(1, container, pages);
			},
			error: (data) => {
				alert(data);
			}
		});
	});

	let btnDeleteTh = document.createElement('th');
	btnDeleteTh.appendChild(btnDelete);

	let tr = document.createElement('tr');
	tr.appendChild(title);
	tr.appendChild(price);
	tr.appendChild(description);
	tr.appendChild(btnDeleteTh);

	return tr;
};

let refreshGoods = (data, container, pages) => {
	if (data['goods'].length > 0) {
		container.innerHTML = '';
		pages.innerHTML = '';
		for (let i = 0; i < data['pages']; i++) {
			let button = document.createElement('button');
			button.className = 'page-link';
			button.appendChild(document.createTextNode(i + 1));
			button.addEventListener('click', function () {
				loadGoods(i + 1, container, pages);
			});
			let li = document.createElement('li');
			li.className = 'page-item';
			li.appendChild(button);
			pages.appendChild(li);
		}
		for (let i = 0; i < data['goods'].length; i++) {
			container.appendChild(createTableRow(data['goods'][i], container, pages));
		}
	} else {
		let listEmpty = document.createElement('h4');
		listEmpty.style.textAlign = 'center';
		listEmpty.style.marginTop = '10px';
		listEmpty.className = 'text-muted';
		listEmpty.appendChild(document.createTextNode('No goods'));
		let root = document.getElementById('available-goods');
		root.innerHTML = '';
		root.appendChild(listEmpty);
	}
};

let loadGoods = (page, container, pages) => {
	util.sendAjax({
		method: 'GET',
		url: '/api/goods',
		params: {
			page: page,
			limit: 10
		},
		success: (data) => {
			refreshGoods(data, container, pages);
		},
		error: (data) => {
			alert(data);
		}
	});
};

document.addEventListener('DOMContentLoaded', () => {
	document.getElementById('btn-logout').addEventListener('click', function () {
		util.eraseCookie('auth_token');
	});
	document.getElementById('available-goods-tab').addEventListener('click', () => {
		loadGoods(
			1,
			document.getElementById('available-goods-tbody'),
			document.getElementById('available-goods-pages')
		);
	});
});
