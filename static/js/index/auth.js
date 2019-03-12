import util from '../util.js'

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

let createLinkButton = (title, href, setMargin, listener = null, id = null, child = null) => {
	let li = document.createElement('li');
	li.classList.add('nav-item');
	let btn = document.createElement('a');
	if (id) {
		btn.id = id;
	}
	btn.className = 'nav-link btn btn-outline-secondary';
	btn.href = href;
	if (setMargin) {
		btn.style.marginRight = '10px';
	}
	if (listener) {
		btn.addEventListener('click', listener);
	}
	if (title) {
		btn.appendChild(document.createTextNode(title));
	}
	if (child) {
		btn.appendChild(child);
	}
	li.appendChild(btn);
	return li;
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
					$('#signUpModal').modal('hide');
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
					util.setCookie('auth_token', data['key'], 1);
					let nav = document.getElementById('nav-buttons');
					nav.innerHTML = '';
					let cartIcon = document.createElement('i');
					cartIcon.className = 'fa fa-shopping-cart';
					cartIcon.setAttribute('aria-hidden', 'true');
					nav.appendChild(
						createLinkButton(null, '/cart', false, null, 'btn-cart', cartIcon)
					);
					if (data['user']['is_superuser']) {
						nav.appendChild(createLinkButton('Administration', '/administration', true));
					}
					nav.appendChild(createLinkButton('Logout', '/logout', false, logout));
					$('#loginModal').modal('hide');
				},
				error: (data) => {
					alert('Login failed: ' + JSON.parse(data)['detail']);
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

document.addEventListener('DOMContentLoaded', () => {
	let nav = document.getElementById('nav-buttons');
	util.userIsAuthenticated(
		(data) => {
			if (data['user']['is_superuser']) {
				nav.appendChild(createLinkButton('Administration', '/administration', true));
			}
			nav.appendChild(createLinkButton('Logout', '/logout', false, logout));
		},
		(data) => {
			let btn = createNavBtn('Login', '#loginModal');
			btn.style.marginRight = '10px';
			nav.appendChild(btn);
			nav.appendChild(createNavBtn('Sign up', '#signUpModal'));
			document.getElementById('btn-login').addEventListener('click', login);
			document.getElementById('btn-register').addEventListener('click', register);
			if (data) {
				console.log(data);
			}
		}
	);
});
