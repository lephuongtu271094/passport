module.exports = function (sequelize, Datatypes) {
    let User = sequelize.define('user', {
        id: {
            type: Datatypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: Datatypes.STRING,
            unique: true
        },
        name: {
            type: Datatypes.STRING,
            allowNull: false
        },
        password: {
            type: Datatypes.STRING,
            allowNull: false
        },
        email: {
            type: Datatypes.STRING,
            allowNull: false
        },
        profileImage: {
            type: Datatypes.STRING,
            allowNull: false
        }
    })

    User.sync();
    return User
}
