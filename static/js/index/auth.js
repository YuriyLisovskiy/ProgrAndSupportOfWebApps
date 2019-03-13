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
				success: () => {
					location.reload();
				},
				error: (data) => {
					alert('Registration failed:\n' + data.detail.detail);
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
					location.reload();
				},
				error: (data) => {
					alert('Login failed: ' + data.detail.detail);
				}
			});
		},
		(errors) => {
			alert('Credentials are invalid:\n' + errors);
		}
	)
};

document.addEventListener('DOMContentLoaded', () => {
	let btnLogin = document.getElementById('btn-login');
	if (btnLogin) {
		btnLogin.addEventListener('click', login);
	}
	let btnRegister = document.getElementById('btn-register');
	if (btnRegister) {
		btnRegister.addEventListener('click', register);
	}
});
