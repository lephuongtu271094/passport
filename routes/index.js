/**
 * Created by tu on 07/07/2017.
 */
const express = require('express');
const router = express.Router();

router.get('/', checkAuthenticated, (req, res) => {

    res.render('index', {
        title: 'Member',
        user: req.user
    })
});


function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    } else {
        res.redirect('/users/login')
    }
}
module.exports = router;
