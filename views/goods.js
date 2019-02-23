module.exports = {
	Goods: async function (request, response) {
		response.setHeader('Content-Type', 'application/json');
		if (request.method === 'GET') {
			let page = request.query.page;
			let limit = 5;

			let data = [
				{
					code: 123,
					title: 'Apple',
					description: 'Some apple product',
					price: 1000
				},
				{
					code: 124,
					title: 'Pie',
					description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
					price: 1001
				},
				{
					code: 125,
					title: 'Samsung',
					description: 'Some apple product',
					price: 1010
				},
				{
					code: 126,
					title: 'Django',
					description: 'Some apple product',
					price: 1100
				},
				{
					code: 127,
					title: 'ASP.NET Core MVC',
					description: 'Some apple product',
					price: 1101
				},
				{
					code: 128,
					title: 'Microsoft',
					description: 'Some apple product',
					price: 1110
				}
			];

			response.send(JSON.stringify({
				goods: data.slice(limit * (page - 1), limit * page),
				pages: Math.ceil(data.length / limit)
			}));
		} else {
			response.status(406);
			response.send(JSON.stringify({error: 'Not Acceptable'}));
		}
	}
};
