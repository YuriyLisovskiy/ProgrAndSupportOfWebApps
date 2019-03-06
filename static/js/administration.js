import util from '/static/js/util.js';

let createGoodsRow = (item, container, pages) => {
	let title = document.createElement('th');
	title.appendChild(document.createTextNode(item['title']));

	let price = document.createElement('th');
	price.appendChild(document.createTextNode('$ ' + item['price']));

	let pDescription = document.createElement('p');
	pDescription.style.textOverflow = 'word-wrap';
	pDescription.style.width = '100%';
	pDescription.appendChild(document.createTextNode(item['description']));

	let description = document.createElement('th');
	description.appendChild(pDescription);

	let btnDelete = document.createElement('button');
	btnDelete.className = 'btn btn-danger';
	btnDelete.type = 'button';
	btnDelete.appendChild(document.createTextNode('Delete'));
	btnDelete.addEventListener('click', () => {
		util.sendAjax({
			method: 'DELETE',
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
		util.appendPages(data['pages'], pages, container, loadGoods);
		for (let i = 0; i < data['goods'].length; i++) {
			container.appendChild(createGoodsRow(data['goods'][i], container, pages));
		}
	} else {
		util.appendNoDataMessage(document.getElementById('available-goods'), 'No goods');
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
	loadGoods(
		1,
		document.getElementById('available-goods-tbody'),
		document.getElementById('available-goods-pages')
	);
	document.getElementById('available-goods-tab').addEventListener('click', () => {
		loadGoods(
			1,
			document.getElementById('available-goods-tbody'),
			document.getElementById('available-goods-pages')
		);
	});
});
