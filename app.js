require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
const sessions = require('express-session')
const cookieParser = require('cookie-parser')

const app = express()

app.use(express.json())

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"))

const oneDay = 1000 * 60 * 60 * 24

app.use(sessions({
    secret: "secret",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false 
}));

const User = require('./models/User')
const { emit } = require('./models/User')

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/formLogin.html")
    // res.status(200).json({ msg: "Bem-vindo "} )
})

app.get('/register', (req, res) => {
    res.sendFile(__dirname + "/formRegister.html")
    // res.status(200).json({ msg: "Bem-vindo "} )
})

app.get('/home', (req, res) => {
    
    if(req.session.loggedIn) {
        res.sendFile(__dirname + "/home.html")
    } else {
        res.redirect('/')
    }
})


app.get('/user/:id', checkToken, async (req, res) => {

    const id = req.params.id

    const user = await User.findById(id, '-password')

    if (!user) {
        return res.status(404).json({ msg: "Usuário não encontrado" })
    }

    res.status(200).json({ user })
})

function checkToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
        return res.status(401).json({ msg: "Acesso negado!" })
    }

    try {
        const secret = process.env.SECRET

        jwt.verify(token, secret)

        next()
    } catch(error) {
        res.status(400).json({ msg: "Token Inválido!" })
    }
}

app.post('/auth/register', async(req, res) => {
    const {name, email, password, confirmpassword} = req.body

    if (!name) {
        return res.status(422).json({ msg: "O nome é obrigatório!" })
    }

    if (!email) {
        return res.status(422).json({ msg: "O e-mail é obrigatório!" })
    }

    if (!password) {
        return res.status(422).json({ msg: "A senha é obrigatória!" })
    }
    
    if (password !== confirmpassword) {
        return res.status(422).json({ msg: "As senhas não são iguais." })
    }

    const userExists = await User.findOne({ email: email })

    if (userExists) {
        return res.status(422).json({ msg: "E-mail já existente! Utilize outro e-mail." })
    }

    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    const user = new User({
        name,
        email, 
        password: passwordHash  
    })

    try {
        await user.save()

        res.status(201).json({ msg: "Usuário criado com sucesso!" })
    } catch(error) {
        res.status(500).json({ msg:error })
    }
})

app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body

    if (!email) {
        return res.status(422).json({ msg: "O e-mail é obrigatório!" })
    }

    if (!password) {
        return res.status(422).json({ msg: "A senha é obrigatória!" })
    }

    const user = await User.findOne({ email: email })

    if (!user) {
        return res.status(404).json({ msg: "Usuáruo inexistente!" })
    }

    const checkpassword = await bcrypt.compare(password, user.password)

    if (!checkpassword) {
        return res.status(422).json({ msg: "Senha inválida" })
    }

    try {
        const secret = process.env.SECRET
        const token = jwt.sign({
            id: user._id
        }, secret, )
        req.session.loggedIn = true
        res.redirect("/home")
    } catch(error) {
        res.status(500).json({ msg:error })
    }
})

const dbUser = process.env.DB_USER
const dbPass = process.env.DB_PASS
const porta = process.env.PORT


mongoose
    .connect(`mongodb+srv://${dbUser}:${dbPass}@cluster0.9pgxywj.mongodb.net/?retryWrites=true&w=majority`,)
    .then(() => {
        app.listen(porta)
        console.log(`Conectou no banco da porta ${porta}`)
})
    .catch((err) => console.log(err))

