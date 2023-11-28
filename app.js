 require('dotenv').config()
 const express= require('express')
 const mongoose = require('mongoose')
 const bcrypt = require('bcrypt')
 const jwt= require('jsonwebtoken')

 const app = express()
 
 app.use(express.json())

 //models
 const User = require('./models/User')
//open rou
app.get('/',(req, res) => {

   res.status(200).json({ msg: 'Bem vindo'})
})
//private rou 

app.get ('/user/:id',checkToken, async (req, res) => {

  const id = req.params.id
  
  const user = await User.findById( id,'-password')


    if(!user){
        return res.status(404).json({msg: 'Usuario nao encontrado'})
    }
    res.status(200).json({user})

})


function checkToken (req, res, next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split('')[1]

if(!token){
    return res.status(401).json({msg:'Acesso negado'})
}
try{ 

    const secret = process.env.SECRET

    jwt.verify(token, secret)
    next()

}catch(error){
    res.status(400).json({msg:'token invalido tnc'})
}
 
}

app.post ('/auth/register', async (req, res) => {
    const { nome, email, password, tell } = req.body;

    if (!nome) {
        return res.status(422).json({ msg: 'nome é obrigatorio' });
    }
    if (!email) {
        return res.status(422).json({ msg: 'email é obrigatorio' });
    }
    if (!password) {
        return res.status(422).json({ msg: 'password é obrigatorio' });
    }
    if (!tell) {
        return res.status(422).json({ msg: 'tell é obrigatorio' });
    }

    try {
        // Cria um novo usuário com os dados recebidos
        const user = new User({ nome, email, tell, password: bcrypt.hashSync(password, 10), tell });

        // Salva o usuário no banco de dados

        res.status(200).json({ msg: 'Usuário registrado com sucesso' });
    } catch (err) {
        res.status(500).json({ msg: 'Ocorreu um erro ao registrar o usuário', error: err });
    }

const userExists = await User.findOne({email: email})
if(userExists){
    return res.status(422).json({ msg: 'E-mail ja cadastrado' });
}

const salt= await bcrypt.genSalt(12)
const passwordHash = await bcrypt.hash(password,salt)
//create user

const user = new User ({
    nome, 
    email,
    password: passwordHash,
    tell,
})
try{
    await user.save()

    res.status(201).json({msg: 'Usuario criado com sucesso' })
    

}catch(error){
    res.status(500).json({msg: errorr})


}

})
//login

app.post ('/auth/login', async (req, res) => {
    const {email, password} = req.body
    if (!email) {
        return res.status(422).json({ msg: 'email é obrigatorio' });
    }
    if (!password) {
        return res.status(422).json({ msg: 'password é obrigatorio' });
    }


//cehcar se ja existe

const user = await User.findOne({email: email})

if(!user){
    return res.status(422).json({ msg: 'Usuario nao encontrado' });
}

//check password
const checkPass = await bcrypt.compare(password, user.password)
if(!checkPass){
    return res.status(422).json({msg:'senha invalida'})
}

try{
    const secret = process.env.SECRET

    const token = jwt.sign(
        {
            id: user._id
        },
        secret,
    )
    res.status(200).json({msg: 'Autenticação realizada com sucecsso', token})
    
    
} catch(error){
    console.log(errorr)
    
    res.status(500).json({msg: 'Aconteceu um erro no servidor!'})
}


})


//credenciais
const dbUser = process.env.DB_USER
const dbPass = process.env.DB_PASS
mongoose.connect(`mongodb+srv://${dbUser}:${dbPass}@cluster0.14g9jis.mongodb.net/?retryWrites=true&w=majority`,
)
.then(() => {
    app.listen(3000)
    console.log('Conectado ao banco')
})
.catch((err)=> console.log(err))


 