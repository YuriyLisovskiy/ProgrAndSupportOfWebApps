import util from '../util.js';

let page = 1;
let modalGoodsPage = 1;
let goodsSelectionPage = 1;

let createPromotionRow = (item) => {
	let id = document.createElement('th');
	id.appendChild(document.createTextNode(item['id']));

	let percentage = document.createElement('th');
	percentage.appendChild(document.createTextNode('-' + item['percentage'] + '%'));

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
	btnViewPromotionGoods.setAttribute('data-toggle', 'modal');
	btnViewPromotionGoods.setAttribute('data-target', '#promotionModal');
	btnViewPromotionGoods.addEventListener('click', () => {
		util.sendAjax({
			method: 'GET',
			url: '/api/promotion/goods',
			params: {
				promotion: item['id'],
				page: 1,
				limit: 5
			},
			success: (data) => {
				modalGoodsPage = 1;
				let root = document.getElementById('promotion-goods-modal-body');
				root.innerHTML = '';
				root.appendChild(createTableBase(data['goods'].length > 0, data, item, root));
				refreshPromotionGoods(data, item, root);
				modalGoodsPage++;
			},
			error: (data) => {
				alert(data);
			}
		});
	});
	let btnViewPromotionGoodsTh = document.createElement('th');
	btnViewPromotionGoodsTh.appendChild(btnViewPromotionGoods);

	let tr = document.createElement('tr');
	tr.appendChild(id);
	tr.appendChild(percentage);
	tr.appendChild(commentTh);
	tr.appendChild(btnViewPromotionGoodsTh);

	return tr;
};

let refreshPromotionGoods = (data, item, root) => {
	let pmt = document.getElementById('promotion-modal-title');
	pmt.innerText = '-' + item['percentage'] + '% | ' + item['comment'];
	util.refreshData(
		data,
		document.getElementById('promotion-goods-tbody'),
		createPromotionGoodsRow,
		modalGoodsPage,
		document.getElementById('show-more-promotion-goods-btn'),
		root,
		'goods'
	);
};

let createTableBase = (appendBtn = false, data, item, root) => {
	let title = document.createElement('th');
	title.appendChild(document.createTextNode('Title'));

	let price = document.createElement('th');
	price.appendChild(document.createTextNode('Price'));

	let priceWithDiscount = document.createElement('th');
	priceWithDiscount.appendChild(document.createTextNode('Price with discount'));

	let manage = document.createElement('th');
	manage.appendChild(document.createTextNode('Manage'));

	let tr = document.createElement('tr');
	tr.appendChild(title);
	tr.appendChild(price);
	tr.appendChild(priceWithDiscount);
	tr.appendChild(manage);

	let thead = document.createElement('thead');
	thead.className = 'thead-dark';
	thead.appendChild(tr);

	let tbody = document.createElement('tbody');
	tbody.id = 'promotion-goods-tbody';

	let table = document.createElement('table');
	table.className = 'table';
	table.appendChild(thead);
	table.appendChild(tbody);

	let result = table;
	if (appendBtn) {
		let moreBtn = document.createElement('button');
		moreBtn.appendChild(document.createTextNode('Load more...'));
		moreBtn.className = 'btn btn-secondary';
		moreBtn.id = 'show-more-promotion-goods-btn';
		moreBtn.addEventListener('click', function () {
			util.sendAjax({
				method: 'GET',
				url: '/api/promotion/goods',
				params: {
					promotion: item['id'],
					page: modalGoodsPage,
					limit: 5
				},
				success: (data) => {
					refreshPromotionGoods(data, item, root);
					modalGoodsPage++;
				},
				error: (data) => {
					alert(data);
				}
			});
		});

		result = document.createElement('div');
		result.appendChild(table);
		result.appendChild(moreBtn);
	}
	return result;
};

let createPromotionGoodsRow = (item) => {
	let title = document.createElement('th');
	title.appendChild(document.createTextNode(item['title']));

	let price = document.createElement('th');
	price.appendChild(document.createTextNode('$ ' + item['price']));

	let priceWithDiscount = document.createElement('th');
	priceWithDiscount.appendChild(document.createTextNode('$ ' + item['discount_price']));

	let btnDelete = document.createElement('button');
	btnDelete.className = 'btn btn-danger';
	btnDelete.type = 'button';
	btnDelete.appendChild(document.createTextNode('Remove'));
	let tr = document.createElement('tr');
	btnDelete.addEventListener('click', () => {
		util.sendAjax({
			method: 'PUT',
			url: '/api/promotion/goods',
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
	tr.appendChild(priceWithDiscount);
	tr.appendChild(btnDeleteTh);

	return tr;
};

let loadGoodsSelection = (selection) => {
	util.sendAjax({
		method: 'GET',
		url: '/api/goods',
		params: {
			page: goodsSelectionPage,
			limit: 10
		},
		success: (data) => {
			if (data.goods.length > 0) {
				for (let i = 0; i < data.goods.length; i++) {
					let option = document.createElement('option');
					option.value = data.goods[i].code;
					option.appendChild(document.createTextNode(data.goods[i].title));
					selection.appendChild(option);
				}
			}
			if (data.pages < goodsSelectionPage) {
				let btn = document.getElementById('select-goods-load-more-btn');
				btn.removeEventListener('click', loadGoodsSelectionEvent);
				btn.parentNode.removeChild(btn);
			}
		},
		error: (data) => {
			alert(data);
		}
	});
};

let loadGoodsSelectionEvent = () => {
	loadGoodsSelection(document.getElementById('select-goods'));
	goodsSelectionPage++;
};

document.addEventListener('DOMContentLoaded', () => {
	let showMorePromotionsTab = document.getElementById('show-more-promotions-tab');
	showMorePromotionsTab.addEventListener('click', function () {
		util.loadPage(
			'api/promotions',
			10,
			page,
			document.getElementById('available-promotions-tbody'),
			createPromotionRow,
			this,
			document.getElementById('available-promotions'),
			'promotions'
		);
		page++;
	});
	showMorePromotionsTab.click();

	let btn = document.getElementById('select-goods-load-more-btn');
	btn.addEventListener(
		'click', loadGoodsSelectionEvent
	);
	btn.click();
});
