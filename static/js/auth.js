import sendAjax from './util.js'

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

let appendLogoutBtn = (nav) => {
	let li = document.createElement('li');
	li.classList.add('nav-item');
	let btn = document.createElement('a');
	btn.className = 'nav-link btn btn-outline-secondary';
	btn.href = '/logout';
	btn.appendChild(document.createTextNode('Logout'));
	li.appendChild(btn);
	nav.innerHTML = '';
	nav.appendChild(li);
};

let register = () => {
	let email = document.getElementById('email-register').value;
	let username = document.getElementById('username-register').value;
	let password = document.getElementById('password-register').value;
	credentialsAreValid({email: email, username: username, password: password},
		() => {
			sendAjax({
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
			alert('Credentials are invalid: ' + errors);
		}
	)
};

let login = () => {
	let username = document.getElementById('username-login').value;
	let password = document.getElementById('password-login').value;
	credentialsAreValid({username: username, password: password},
		() => {
			sendAjax({
				method: 'POST',
				url: '/api/login',
				params: {
					username: username,
					password: password
				},
				success: () => {
					appendLogoutBtn(document.getElementById('nav-buttons'));
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

document.onreadystatechange = () => {
	if (document.readyState === 'complete') {
		document.getElementById('btn-register').addEventListener('click', register);
		document.getElementById('btn-login').addEventListener('click', login);
	}
};
