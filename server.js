const express = require("express");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.json());
app.use(cookieParser());

const PORT = 3000;
const SECRET = "secreto123";

// Usuarios falsos
const users = [
  { username: "admin", password: "1234" },
  { username: "user", password: "abcd" }
];

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Servidor funcionando");
});
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({
      message: "Credenciales incorrectas. No autorizado."
    });
  }

  const token = jwt.sign({ username: user.username }, SECRET, {
    expiresIn: "1h"
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: false // pon true si usas https
  });

  res.json({ message: "Login exitoso" });
});
function verificarToken(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "No autorizado" });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido" });
  }
}
app.get("/perfil", verificarToken, (req, res) => {
  res.json({
    message: "Ruta privada",
    user: req.user
  });
});
app.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Sesión cerrada" });
});
app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});