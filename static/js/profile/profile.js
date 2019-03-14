import util from "../util.js";

function manageGoods (url, code, amount, rmItem) {
	util.sendAjax({
		method: 'POST',
		url: url,
		params: {
			amount: amount,
			goods_code: code
		},
		success: (data) => {
			if (data.amount < 1) {
				rmItem();
			} else {
				let amountContainer = document.getElementById('amount-' + code);
				amountContainer.innerText = data.amount.toString();
				amountContainer.setAttribute('value', data.amount);
			}
		},
		error: (err) => {
			alert(err.detail.detail);
		}
	});
}

function resetSum (totalSumContainer, code, sign = 1) {
	let totalSum = parseFloat(totalSumContainer.getAttribute('value'));
	let itemPrice = parseFloat(document.getElementById('item-price-' + code).getAttribute('value'));
	let newSum = Number(totalSum + itemPrice * sign).toFixed(2);
	totalSumContainer.innerText = '$ ' + (newSum).toString();
	totalSumContainer.setAttribute('value', newSum);
}

document.addEventListener('DOMContentLoaded', function domLoadedListener() {
	let active_tab_profile = util.getCookie('active_tab_profile');

	let profileDiv = document.getElementById('profile');
	let profileTab = document.getElementById('profile-tab');
	let cartDiv = document.getElementById('cart');
	let cartTab = document.getElementById('cart-tab');

	if (active_tab_profile && active_tab_profile === 'cart') {
		profileDiv.className += ' fade';
		cartDiv.className += ' active show';
		cartTab.className += ' active show';
	} else {
		profileDiv.className += ' active show';
		profileTab.className += ' active show';
		cartDiv.className += ' fade';
	}

	let totalSumContainer = document.getElementById('total-sum');

	let increaseButtons = document.getElementsByName('increase-goods');
	for (let i = 0; i < increaseButtons.length; i++) {
		increaseButtons[i].addEventListener('click', function addGoods() {
			resetSum(totalSumContainer, this.value, 1);
			manageGoods('/api/cart/goods/add', this.value, 1, () => {});
		});
	}

	let decreaseButtons = document.getElementsByName('decrease-goods');
	for (let i = 0; i < decreaseButtons.length; i++) {
		decreaseButtons[i].addEventListener('click', function decreaseGoods() {
			resetSum(totalSumContainer, this.value, -1);
			manageGoods('/api/cart/goods/remove', this.value, 1, () => {
				this.removeEventListener('click', decreaseGoods);
				let row = document.getElementById('goods-item-' + this.value);
				this.parentNode.parentNode.parentNode.removeChild(row);
			});
		});
	}

	let removeGoodsButtons = document.getElementsByName('remove-goods');
	for (let i = 0; i < removeGoodsButtons.length; i++) {
		removeGoodsButtons[i].addEventListener('click', function rmGoods() {
			let amount = parseInt(document.getElementById('amount-' + this.value).getAttribute('value'));
			resetSum(totalSumContainer, this.value, -amount);
			manageGoods('/api/cart/goods/remove', this.value, amount, () => {
				this.removeEventListener('click', rmGoods);
				let row = document.getElementById('goods-item-' + this.value);
				this.parentNode.parentNode.parentNode.removeChild(row);
			});
		});
	}
	document.removeEventListener('DOMContentLoaded', domLoadedListener);
});
