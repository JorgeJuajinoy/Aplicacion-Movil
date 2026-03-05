const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Conexión a MongoDB Atlas
mongoose
  .connect(
    "mongodb+srv://jorgejuajinoy:app_1234@cluster0.jsza72z.mongodb.net/apiUsuarios?appName=Cluster0",
  )
  .then(() => console.log("✅ Conectado a MongoDB Atlas"))
  .catch((err) => console.error("❌ Error de conexión:", err));

// Modelo de Usuario
const Usuario = mongoose.model(
  "Usuario",
  new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
  }),
);

// CREATE - Registrar usuario
app.post("/usuarios", async (req, res) => {
  try {
    const nuevoUsuario = new Usuario(req.body);
    await nuevoUsuario.save();
    res.json({
      success: true,
      message: "Usuario creado",
      usuario: nuevoUsuario,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al crear usuario" });
  }
});

// READ - Listar todos los usuarios
app.get("/usuarios", async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.json(usuarios);
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error al obtener usuarios" });
  }
});

// READ - Obtener un usuario por ID
app.get("/usuarios/:id", async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (usuario) {
      res.json(usuario);
    } else {
      res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error al obtener usuario" });
  }
});

// UPDATE - Actualizar usuario por ID
app.put("/usuarios/:id", async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (usuario) {
      res.json({ success: true, message: "Usuario actualizado", usuario });
    } else {
      res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error al actualizar usuario" });
  }
});

// DELETE - Eliminar usuario por ID
app.delete("/usuarios/:id", async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndDelete(req.params.id);
    if (usuario) {
      res.json({ success: true, message: "Usuario eliminado" });
    } else {
      res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error al eliminar usuario" });
  }
});

// Endpoint de prueba
app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});

// Iniciar servidor
app.listen(3000, () =>
  console.log("Servidor escuchando en http://localhost:3000"),
);
