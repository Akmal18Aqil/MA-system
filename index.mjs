import express from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
dotenv.config();
import UsersRoute from "./routes/Users.mjs";
import ProductsRoute from "./routes/Products.mjs";
import AuthRoute from "./routes/Auth.mjs";
import MahasantriRoute from "./routes/Mahasantri.mjs";
import db from "./config/Database.mjs";
import SequelizeStore from "connect-session-sequelize";
import { notFound, errorHandler } from "./middleware/ErrorMiddleware.mjs";
import cookieParser from "cookie-parser";

const app = express();
// const sessionStore = SequelizeStore(session.Store);

// const store = new sessionStore({
//   db: db,
// });
// sessionStore.sync();
// (async()=>{
//     await db.sync();
// })();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    exposedHeaders: ["Content-Length", "X-JSON"],
  })
);
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET_KEY, // Replace with your own secret key
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: "auto" }, // Set to true if using HTTPS
//   })
// );

app.use(UsersRoute);
app.use(ProductsRoute);
app.use(AuthRoute);
app.use(MahasantriRoute);
// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// store.sync();
// (async () => {
//     try {
//         await db.sync({ force: true }); // Menghapus tabel yang ada dan membuatnya kembali
//         console.log("Tabel berhasil disinkronisasi");
//     } catch (error) {
//         console.error("Gagal menyinkronisasi tabel:", error);
//     }
// })();
app.listen(process.env.APP_PORT, () => {
  console.log(`Server is running on ${process.env.APP_HOST}`);
});
