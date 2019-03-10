import util from '../util.js';

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

let loadPromotionsSelection = () => {
	util.sendAjax({
		method: 'GET',
		url: '/api/promotions',
		params: {
			page: 1,
			limit: 100
		},
		success: (data) => {
			if (data.promotions.length > 0) {
				let list = document.getElementById('select-promotion');
				for (let i = 0; i < data['promotions'].length; i++) {
					let option = document.createElement('option');
					option.value = data['promotions'][i].id;
					option.appendChild(document.createTextNode(data['promotions'][i].comment));
					list.appendChild(option);
				}
			}
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
	let showMoreGoodsTab = document.getElementById('show-more-goods-tab');
	showMoreGoodsTab.addEventListener('click', function () {
		util.loadPage(
			'api/goods',
			10,
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

	loadPromotionsSelection();
});
