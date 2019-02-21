import util from './util.js'

let credentialsAreValid = ({email, username, password}, success, error) => {
	let errors = '';
	if (email != null && email.length < 1) {
		errors += '* Email can not be empty\n';
	}
	if (username.length < 1) {
		errors += '* Username can not be empty\n';
	}
	if (password.length < 1) {
		errors += '* Password can not be empty';
	}
	if (errors.length > 0) {
		error(errors);
	} else {
		success();
	}
};

let closeModal = (modal) => {
	modal.classList.remove('show');
	modal.setAttribute('aria-hidden', 'true');
	modal.setAttribute('style', 'display: none');
	const modalBackdrops = document.getElementsByClassName('modal-backdrop');
	document.body.removeChild(modalBackdrops[0]);
};

let setLogoutBtn = (nav) => {
	let li = document.createElement('li');
	li.classList.add('nav-item');
	let btn = document.createElement('a');
	btn.className = 'nav-link btn btn-outline-secondary';
	btn.href = '/logout';
	btn.id = 'btn-logout';
	btn.appendChild(document.createTextNode('Logout'));
	li.appendChild(btn);
	nav.appendChild(li);
};

let createNavBtn = (title, dataTarget) => {
	let li = document.createElement('li');
	li.classList.add('nav-item');
	let btn = document.createElement('button');
	btn.className = 'nav-link btn btn-outline-secondary';
	btn.appendChild(document.createTextNode(title));
	btn.setAttribute('data-toggle', 'modal');
	btn.setAttribute('data-target', dataTarget);
	li.appendChild(btn);
	return li;
};

let setLoginBtn = (nav) => {
	let btn = createNavBtn('Login', '#loginModal');
	btn.style.marginRight = '10px';
	nav.appendChild(btn);
};

let setRegisterBtn = (nav) => {
	nav.appendChild(createNavBtn('Sign up', '#signUpModal'));
};

let register = () => {
	let email = document.getElementById('email-register').value;
	let username = document.getElementById('username-register').value;
	let password = document.getElementById('password-register').value;
	credentialsAreValid({email: email, username: username, password: password},
		() => {
			util.sendAjax({
				method: 'POST',
				url: '/api/register',
				params: {
					username: username,
					email: email,
					password: password
				},
				success: (data) => {
					alert(data['detail']);
					closeModal(document.getElementById('signUpModal'));
				},
				error: (data) => {
					alert('Registration failed:\n' + data['detail']);
				}
			});
		},
		(errors) => {
			alert('Credentials are invalid:\n' + errors);
		}
	)
};

let login = () => {
	let username = document.getElementById('username-login').value;
	let password = document.getElementById('password-login').value;
	credentialsAreValid({username: username, password: password},
		() => {
			util.sendAjax({
				method: 'POST',
				url: '/api/login',
				params: {
					username: username,
					password: password
				},
				success: (data) => {
					console.log(data);
					util.setCookie('auth_token', data['key'], 1);
					let nav = document.getElementById('nav-buttons');
					nav.innerHTML = '';
					setLogoutBtn(nav);
					closeModal(document.getElementById('loginModal'));
				},
				error: (data) => {
					alert('Login failed: ' + data['detail']);
				}
			});
		},
		(errors) => {
			alert('Credentials are invalid:\n' + errors);
		}
	)
};

let logout = () => {
	util.eraseCookie('auth_token');
};

document.onreadystatechange = () => {
	if (document.readyState === 'complete') {
		let nav = document.getElementById('nav-buttons');
		let token = util.getCookie('auth_token');
		if (token) {
			util.sendAjax({
				method: 'POST',
				url: '/api/token/verify',
				headers: {
					authorization: 'Token ' + token
				},
				success: () => {
					// nav.innerHTML = '';
					setLogoutBtn(nav);
					document.getElementById('btn-logout').addEventListener('click', logout);
				},
				error: (data) => {
					// nav.innerHTML = '';
					setLoginBtn(nav);
					setRegisterBtn(nav);
					document.getElementById('btn-login').addEventListener('click', login);
					document.getElementById('btn-register').addEventListener('click', register);
					console.log(data);
				}
			});
		} else {
			setLoginBtn(nav);
			setRegisterBtn(nav);
			document.getElementById('btn-login').addEventListener('click', login);
			document.getElementById('btn-register').addEventListener('click', register);
		}
	}
};
