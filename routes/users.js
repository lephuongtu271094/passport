/**
 * Created by tu on 07/07/2017.
 */
const express = require('express');
const router = express.Router();
const multer = require('multer');
const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport');
const {db,} = require('../sqlize');
const bcrypt = require('bcrypt');

passport.serializeUser((user, done) => {
    done(null, user.id)
});

passport.deserializeUser((id, done) => {
    db.user.findById(id).then(user => {
        done(null, user)
    }).catch(err => {
        console.log(err)
    })
})

passport.use(new LocalStrategy(
    (username, password, done) => {

        db.user.find({
            where: {
                username: username
            }
        }).then(user => {
            // console.log(user.password)
            if (!user) {
                return done(null, false, {
                    message: 'Incorrect username and password'
                })
            }
            bcrypt.compare(password, user.password, (err, result) => {

                if (err) {
                    return done(err)
                }
                if (!result) {
                    return done(null, false, {
                        message: 'Incorrect username and password'
                    })
                }
                return done(null, user)
            })
        }).catch(err => {
            return done(err)
        })
    }
))

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
router.upload = multer({storage: storage, fileFilter: fileFilter})


router.route('/register')
    .get((req, res) => {
        res.render('register', {
            title: 'Register'
        })
    })
    .post(router.upload.single('proFileImage'), (req, res) => {
        let name = req.body.name;
        let email = req.body.email;
        let username = req.body.username;
        let password = req.body.password;
        let passwordConfirm = req.body.password2;

        if (req.file) {
            var profileImage = req.file.filename;
        } else {
            var profileImage = 'noimage.png'
        }
        // console.log(req.file)

        req.checkBody('name', 'Name field is required').notEmpty();
        req.checkBody('email', 'Email field is required').notEmpty();
        req.checkBody('email', 'Email not vaid').isEmail();
        req.checkBody('username', 'Username field is required').notEmpty();
        req.checkBody('password', 'Password field is required').notEmpty();
        req.checkBody('password2', 'Password do not match').equals(req.body.password);

        let errors = req.validationErrors();
        if (errors) {
            res.render('register', {
                errors: errors,
                name: name,
                email: email,
                username: username,
                password: password,
                password2: passwordConfirm
            })
        } else {
            db.user.find({
                where: {
                    username: username
                }
            }).then(result => {
                if (result) {
                    req.flash('danger', 'Username already exists');
                    return res.render('register', {
                        name: name,
                        email: email,
                        username: username,
                        password: password,
                        password2: passwordConfirm
                    })
                }
                let that = db;
                bcrypt.hash(password, 10, function (err, hash) {
                    if (err) throw  err;
                    that.user.create({
                        name: name,
                        email: email,
                        username: username,
                        password: hash,
                        profileImage: profileImage
                    }).then(() => {
                        req.flash('success', 'Register successfully');
                        res.redirect('/')
                    }).catch((err) => {
                        if (err) throw err;
                    })
                    // console.log(hash)
                })
            })
        }
    })
router.route('/login')
    .get((req, res) => {
        res.render('login', {
            title: 'Login'
        })
    })
    .post(passport.authenticate('local', {
            failureRedirect: '/users/login',
            failureFlash: 'Invalid username and password'
        }),

        (req, res) => {
            console.log('Authentication successful');
            req.flash('success', 'you are logged in');

            let checkUsername = req.body.username;
            db.user.find({
                where: {
                    username: checkUsername
                }
            }).then(arr => {
                res.redirect('/')
            })
        });
router.route('/logout')
    .get((req, res) => {
        req.logout();
        req.flash('success', 'You logged out');
        res.redirect('/users/login');
    });

module.exports = router;