import express from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
dotenv.config();
import UsersRoute from "./routes/Users.mjs";
import ProductsRoute from "./routes/Products.mjs";
import AuthRoute from "./routes/Auth.mjs";
import db from "./config/Database.mjs";
import SequelizeStore from "connect-session-sequelize";

const app = express();
const sessionStore = SequelizeStore(session.Store);

const store = new sessionStore({
    db: db
});

// (async()=>{
//     await db.sync();
// })();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: process.env.APP_HOST, credentials: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY, // Replace with your own secret key
    resave: false,
    store: store,
    saveUninitialized: true,
    cookie: { secure: "auto" }, // Set to true if using HTTPS
  })
);

app.use(UsersRoute);
app.use(ProductsRoute);
app.use(AuthRoute);

app.listen(process.env.APP_PORT, () => {
  console.log("Server is running");
});

