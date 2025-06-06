import { Sequelize, UUID, UUIDV1, UUIDV4 } from "sequelize";
import db from "../config/Database.mjs";

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
    }
}, {
    freezeTableName: true
});

export default Users;