import util from '/static/js/util.js';

let createPromotionRow = (item, container, pages) => {
	let id = document.createElement('th');
	id.appendChild(document.createTextNode(item['id']));

	let percentage = document.createElement('th');
	percentage.appendChild(document.createTextNode(item['percentage'] + '%'));

	let comment = document.createElement('p');
	comment.style.textOverflow = 'word-wrap';
	comment.style.width = '100%';
	comment.appendChild(document.createTextNode(item['comment']));

	let commentTh = document.createElement('th');
	commentTh.appendChild(comment);

	let btnViewPromotionGoods = document.createElement('button');
	btnViewPromotionGoods.className = 'btn btn-success';
	btnViewPromotionGoods.type = 'button';
	btnViewPromotionGoods.appendChild(document.createTextNode('View Goods'));
	/*
	btnViewPromotionGoods.addEventListener('click', () => {
		util.sendAjax({
			method: 'GET',
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
	*/

	let btnViewPromotionGoodsTh = document.createElement('th');
	btnViewPromotionGoodsTh.appendChild(btnViewPromotionGoods);

	let tr = document.createElement('tr');
	tr.appendChild(id);
	tr.appendChild(percentage);
	tr.appendChild(commentTh);
	tr.appendChild(btnViewPromotionGoodsTh);

	return tr;
};

let refreshPromotions = (data, container, pages) => {
	if (data['promotions'].length > 0) {
		container.innerHTML = '';
		pages.innerHTML = '';
		util.appendPages(data['pages'], pages, container, loadPromotions);
		for (let i = 0; i < data['promotions'].length; i++) {
			container.appendChild(createPromotionRow(data['promotions'][i], container, pages));
		}
	} else {
		util.appendNoDataMessage(document.getElementById('available-promotions'), 'No promotions');
	}
};

let loadPromotions = (page, container, pages) => {
	util.sendAjax({
		method: 'GET',
		url: '/api/promotions',
		params: {
			page: page,
			limit: 10
		},
		success: (data) => {
			refreshPromotions(data, container, pages);
		},
		error: (data) => {
			alert(data);
		}
	});
};

document.addEventListener('DOMContentLoaded', () => {
	loadPromotions(
		1,
		document.getElementById('available-promotions-tbody'),
		document.getElementById('available-promotions-pages')
	);
	document.getElementById('available-promotions-tab').addEventListener('click', () => {
		loadPromotions(
			1,
			document.getElementById('available-promotions-tbody'),
			document.getElementById('available-promotions-pages')
		);
	});
});
