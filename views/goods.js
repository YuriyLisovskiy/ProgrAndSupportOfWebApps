module.exports = {
	Goods: async function (request, response) {
		response.setHeader('Content-Type', 'application/json');
		if (request.method === 'GET') {
			let page = request.query.page;
			let limit = 5;

			let data = [
				{
					name: 'Apple',
					price: '1000$'
				},
				{
					name: 'Grapes',
					price: '1001$'
				},
				{
					name: 'Orange',
					price: '1010$'
				},
				{
					name: 'Car',
					price: '1000$'
				},
				{
					name: 'Django',
					price: '1001$'
				},
				{
					name: 'Python',
					price: '1010$'
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
