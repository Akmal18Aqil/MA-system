import { Sequelize, UUID, UUIDV1, UUIDV4 } from "sequelize";
import db from "../config/Database.mjs";
import { validate } from "../middleware/ValidationMiddleware.mjs";
// import { not } from "joi"; // <--- This line is removed

const { DataTypes } = Sequelize;
const Users = db.define('users', {
    uuid: {
        type: DataTypes.STRING,
        defaultValue: UUIDV4,
        allowNull: false,
        validate: {
            notEmpty: true,
            len : [3, 100],
        },
    },
    name:{
        type: DataTypes.STRING,
        allowNull: false,
        validate:{
            notEmpty: true,
            len: [3, 100]
        }
    },
    email:{
        type: DataTypes.STRING,
        allowNull: false,
        validate:{
            notEmpty: true,
            isEmail: true
        }
    },
    nim: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        validate: {
            isNumeric: true,
            len: [5, 20]
        }
    },
    isFirstLogin: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    password:{
        type: DataTypes.STRING,
        allowNull: false,
        validate:{
            notEmpty: true
        }
    },
    role:{
        type: DataTypes.STRING,
        allowNull: false,
        validate:{
            notEmpty: true
        }
    },
    refreshToken: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
            notEmpty: true,
        }
  }
}, {
    freezeTableName: true
});

export default Users;