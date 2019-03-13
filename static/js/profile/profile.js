import util from "../util.js";

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

	document.removeEventListener('DOMContentLoaded', domLoadedListener);
});
