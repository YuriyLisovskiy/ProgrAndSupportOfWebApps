import util from './util.js'

let createGoodsItem = (item) => {
	let img = document.createElement('img');
	img.className = 'card-img-top';
	img.src = 'https://vignette.wikia.nocookie.net/cartoonsserbia/images/4/42/Image-not-available_1.jpg/revision/latest?cb=20180603222946';
	img.alt = 'Goods image';
	img.style.height = '310px';

	let cardTitle = document.createElement('h4');
	cardTitle.className = 'card-title';
	cardTitle.appendChild(document.createTextNode(item['title']));

	let popover = document.createElement('button');
	popover.className = 'btn btn-secondary';
//	popover.setAttribute('data-container', 'body');
	popover.setAttribute('data-toggle', 'popover');
	popover.setAttribute('data-placement', 'top');
	popover.setAttribute('data-content', item['description']);
	popover.setAttribute('data-trigger', 'focus');
	popover.style.float = 'right';
	popover.style.height = '25px';
	popover.style.padding = '5px';
	popover.style.paddingTop = '0';
	popover.style.paddingBottom = '7px';
	popover.appendChild(document.createTextNode('more'));

	let description = document.createElement('p');
	description.className = 'text-truncate';
	description.style.width = '80%';
	description.appendChild(document.createTextNode(item['description']));

	let cardText = document.createElement('div');
	cardText.className = 'card-text';
	cardText.appendChild(popover);
	cardText.appendChild(description);

	let price = document.createElement('span');
	price.className = 'badge badge-pill badge-danger';
	price.style.float = 'left';
	price.appendChild(document.createTextNode('$ ' + item['price']));

	let btn = document.createElement('button');
	btn.className = 'btn btn-success';
	btn.style.float = 'right';
	btn.setAttribute('value', item['code']);
	btn.appendChild(document.createTextNode('Add to cart'));

	let cardBody = document.createElement('div');
	cardBody.className = 'card-body';
	cardBody.appendChild(cardTitle);
	cardBody.appendChild(cardText);
	cardBody.appendChild(price);
	cardBody.appendChild(btn);

	let card = document.createElement('div');
	card.className = 'card';
	card.style.width = '300px';
	card.style.height = '460px';
	card.appendChild(img);
	card.appendChild(cardBody);

	return card;
};

let updateGoods = (data, container, pages) => {
	container.innerHTML = '';
	pages.innerHTML = '';
	for (let i = 0; i < data['pages']; i++) {
		let button = document.createElement('button');
		button.appendChild(document.createTextNode(i + 1));
		button.addEventListener('click', function () {
			loadGoods(i + 1, container, pages);
		});
		pages.appendChild(button);
	}
	for (let i = 0; i < data['goods'].length; i++) {
		let row = document.createElement('div');
		row.className = 'row';
		let j = i;
		for (j = i; j < i + 3 && j < data['goods'].length; j++) {
			row.appendChild(createGoodsItem(data['goods'][j]));
		}
		i += j - 1;
		container.appendChild(row);
	}
};

let initGoodsList = (root) => {
	let pages = document.createElement('div');
	pages.id = 'pages';

	let container = document.createElement('div');
	container.className = 'container';

	root.innerHTML = '';
	root.appendChild(pages);
	root.appendChild(container);

	loadGoods(1, container, pages);
};

let loadGoods = (page, container, pages) => {
	util.sendAjax({
		method: 'GET',
		url: '/api/goods',
		params: {
			page: page
		},
		success: (data) => {
			updateGoods(data, container, pages);
		},
		error: (data) => {
			alert(data);
		}
	});
};

document.addEventListener('DOMContentLoaded', function(e) {
	initGoodsList(document.getElementById('root'));
});
