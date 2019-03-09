import util from '/static/js/util.js';

let page = 1;

let createGoodsRow = (item) => {
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
	let tr = document.createElement('tr');
	btnDelete.addEventListener('click', () => {
		util.sendAjax({
			method: 'DELETE',
			url: '/api/goods',
			params: {
				goods_code: item['code']
			},
			success: () => {
				tr.parentNode.removeChild(tr);
			},
			error: (data) => {
				alert(data);
			}
		});
	});

	let btnDeleteTh = document.createElement('th');
	btnDeleteTh.appendChild(btnDelete);
	tr.appendChild(title);
	tr.appendChild(price);
	tr.appendChild(description);
	tr.appendChild(btnDeleteTh);

	return tr;
};

document.addEventListener('DOMContentLoaded', () => {
	document.getElementById('btn-logout').addEventListener('click', function () {
		util.eraseCookie('auth_token');
	});
	let showMoreGoodsTab = document.getElementById('show-more-goods-tab');
	showMoreGoodsTab.addEventListener('click', function () {
		util.loadPage(
			'api/goods',
			1,
			page,
			document.getElementById('available-goods-tbody'),
			createGoodsRow,
			document.getElementById('show-more-goods-tab'),
			document.getElementById('available-goods'),
			'goods'
		);
		page++;
	});
	showMoreGoodsTab.click();
});