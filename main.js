var express = require('express'),
    path = require('path'),
    multer = require('multer'),
    mongoose = require('mongoose'),
    bcrypt = require("bcrypt"),
    session = require("express-session"),
    bodyParser = require('body-parser'),
    app = express();

app.use(bodyParser.urlencoded({extended: true}));

app.use(bodyParser.json());

app.use(multer({
    dest: 'uploads'
})); 

app.use(session({
    secret: 'sfg4t4rjmdf',
    resave: false,
    saveUninitialized: true
}));

mongoose.connect('mongodb://localhost:27017/mystorage', (err) => {
    if(err) {
        console.log('Algo de errado aconteceu ao ligar o servidor!')
    } else {
        app.listen(3060, () => {
            console.log('My storage ligado na porta 3060.');
        });
    }
});


app.use(express.static(path.join(__dirname, 'bower_components')));

app.get('/upload', (req, res) => {
    if(!req.session.user) {
        res.redirect('/')
    } else {
        res.sendFile(path.join(__dirname +  '/views/upload.html'));
    }

});

app.get('/', (req, res) => {

    if(!req.session.user) {

        res.sendFile(path.join(__dirname +  '/views/login.html'));

    } else {

        res.redirect('/upload');

    }

});

// app.get('/ficheiros', (req, res) => {
    
//     if(!req.session.user) {
//         res.redirect('/')
//     }

// })


let saltRounds = 10;
app.post('/registo', (req, res) => {

        let username = req.body.username;
        let passwordi = req.body.password;
    
        // Salvar User e encriptar password
        bcrypt.hash(passwordi, saltRounds, (err, hash) => {
            var salvarUser = new User();
    
            salvarUser.username = username;
            salvarUser.password = hash;
    
            salvarUser.save((err, savedUser) => {
                if (err) {
                    console.log(err);

                    res.redirect('/');
                } else {

                    res.redirect('/');
                }
            })
    });
});

app.get('/sair', (req, res) => {
    
    req.session.user = null;
    res.redirect('/')

});

app.post('/login', (req, res) => {
        
    let username = req.body.username;
    let password = req.body.password;

    // Procurar na base de dados
    User.findOne({
        username: username,
    },(err, user) => {
        if(!user) {
            res.redirect('/');
        } else {
            bcrypt.compare(password, user.password, (err, resp) => {
                if (err) {
                    console.log(err);
                }
                if(resp == true) {

                    req.session.user = user;
                    res.redirect('/upload');

                } else {

                    res.redirect('/')

                }
            });
        }
})
})

app.post('/', (req, res) => {
    if(!req.session.user) {
        res.redirect('/')
    } else {
        console.log(req.files);

        var files = req.files.file;
    
        if (Array.isArray(files)) {
            console.log('Foi feito o upload de varios ficheiros.');
        }
        else {
            console.log('Foi feito o upload de um ficheiro.');
        }
    
        res.sendStatus(200);
    }
});


var userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

var User = mongoose.model('users', userSchema);