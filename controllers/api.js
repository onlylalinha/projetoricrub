exports.test = (req, res) => {res.send('Teste Controller!')}

exports.login = (req, res) => {res.send('Tela de Login')}

exports.details = (req, res) => {res.send({type: 'GET'})}
exports.add = (req, res) => {res.send({type: 'POST'})}
exports.update = (req, res) => {res.send({type: 'PUT'})}
exports.delete = (req, res) => {res.send({type: 'DELETE'})}

exports.create = (req, res) => {
    console.log('Você fez uma requisição do tipo POST', req.body)
    res.send({
        type: 'POST',
        name: req.body.name,
        rank: req.body.rank });
};