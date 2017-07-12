const express = require('express');
const router = express.Router();
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyPerser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const nunjucks = require('nunjucks');
const {db,} = require('./sqlize');
const multer = require('multer');
const port = 3000;

db['user'] = db.import(__dirname + '/models/user.js');


const app = express();


nunjucks.configure('views', {
    autoescape: true,
    express: app
});

app.engine('html', nunjucks.render);
app.set('view engine', 'html');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyPerser.json());
app.use(logger('dev'));
app.use(cookieParser('techmaster'));
app.use(bodyPerser.urlencoded({extended: flash}));

app.use(session({
    secret: "secret",
    key: "techmaster.vn",
    saveUninitialized: true,
    resave: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(expressValidator({
    errorFormatter: (param, msg, value) => {
        let namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;
        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        }
    }
}));
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        //nơi chứa file upload
        cb(null, './public/uploads')
    },
    filename: function (req, file, cb) {
        // cb(null, shortid.generate() + '-' + file.originalname)
        // Tạo tên file mới cho file vừa upload
        cb(null, file.originalname)
    }

})

function fileFilter(req, file, cb) { // hàm phân loại file upload
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') { // nếu là đuôi png,jpg,jpeg
        // nếu là file image thì upload file.
        cb(null, true)
    } else {
        // nếu không phải thì bỏ qua phần upload
        cb(new Error(file.mimetype + ' is not accepted'))
    }
}
// các thuộc tính của multer gán cho biến upload
app.upload = multer({storage: storage, fileFilter: fileFilter})

app.use(flash());
app.use((req, res, next) => {
    res.locals.messages = req.session.flash;
    delete req.session.flash;
    next();
});

app.get('*', (req, res, next) => {
    res.locals.user = req.user || null
    next()
})

const routes = require('./routes/index');
const users = require('./routes/users');

app.use('/', routes);
app.use('/users', users);

app.use((req, res, next) => {
    let err = new Error('Not Found');
    err.status = 404;
    next(err)
});
if (app.get('env') === 'development') {
    app.use((err, req, res, next) => {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        })
    })
}
app.use((err, req, res, next) => {
    res.status(err.stauts || 500);
    res.render('error', {
        message: err.message,
        error: {}
    })
});


app.listen(port, () => {
    console.log('app listen port:' + port);
});