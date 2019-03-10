import util from '../util.js'

let goodsPage = 1;

let createGoodsItem = (item) => {
	let img = document.createElement('img');
	img.className = 'card-img-top';
	if (item.image) {
		img.src = item.image;
	} else {
		img.src = 'https://vignette.wikia.nocookie.net/cartoonsserbia/images/4/42/Image-not-available_1.jpg/revision/latest?cb=20180603222946';
	}
	img.alt = 'Goods image';
	img.style.height = '310px';

	let cardTitle = document.createElement('h4');
	cardTitle.className = 'card-title';
	cardTitle.appendChild(document.createTextNode(item['title']));

	let description = document.createElement('p');
	description.className = 'text-truncate';
	description.style.width = '80%';
	description.appendChild(document.createTextNode(item['description']));

	let cardText = document.createElement('div');
	cardText.className = 'card-text';
	if (item['description'].length > 26) {
		let popover = document.createElement('button');
		popover.className = 'btn btn-secondary';
		popover.setAttribute('data-toggle', 'popover');
		popover.setAttribute('data-placement', 'top');
		popover.setAttribute('data-trigger', 'focus');
		popover.setAttribute('data-content', item['description']);
		popover.style.float = 'right';
		popover.style.height = '25px';
		popover.style.padding = '5px';
		popover.style.paddingTop = '0';
		popover.style.paddingBottom = '7px';
		popover.appendChild(document.createTextNode('more'));
		cardText.appendChild(popover);
	}
	cardText.appendChild(description);

	let price = document.createElement('span');
	price.className = 'badge badge-pill badge-danger';
	price.style.float = 'left';
	if (!item.discount_price) {
		price.style.backgroundColor = '#517c1b';
	} else {
		price.style.textDecoration = 'line-through';
	}
	price.appendChild(document.createTextNode('$ ' + item['price']));

	let discount_price = document.createElement('span');
	if (item.discount_price) {
		discount_price.className = 'badge badge-pill badge-danger';
		discount_price.style.float = 'left';
		discount_price.style.marginLeft = '10px';
		discount_price.style.backgroundColor = '#517c1b';
		discount_price.appendChild(document.createTextNode('$ ' + item.discount_price));
	}

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
	if (item.discount_price) {
		cardBody.appendChild(discount_price);
	}
	cardBody.appendChild(btn);

	let card = document.createElement('div');
	card.className = 'card ml-5 mb-5';
	card.style.width = '300px';
	card.style.height = '460px';
	card.appendChild(img);
	card.appendChild(cardBody);

	return card;
};

document.addEventListener('DOMContentLoaded', function() {
	let container = document.getElementById('container');

	let ulPages = document.createElement('ul');
	ulPages.className = 'pagination justify-content-center';
	ulPages.style.marginTop = '10px';
	ulPages.id = 'goods-list';

	let moreBtn = document.createElement('button');
	moreBtn.className = 'btn btn-secondary';
	moreBtn.appendChild(document.createTextNode('Load more...'));
	moreBtn.addEventListener('click', function() {
		util.loadPage(
			'/api/goods',
			10,
			goodsPage,
			ulPages,
			createGoodsItem,
			this,
			container,
			'goods'
		);
		goodsPage++;
	});
	moreBtn.click();

	container.appendChild(ulPages);
	container.appendChild(moreBtn);
});
