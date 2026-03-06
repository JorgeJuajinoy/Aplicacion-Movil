require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = process.env.PORT || 3000; // Render asigna su propio puerto

// Middleware
app.use(express.json());
app.use(cors());

// Conexión a MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB Atlas"))
  .catch((err) => console.error("❌ Error de conexión:", err));

// Esquema de Usuario
const usuarioSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});

// Middleware para encriptar contraseña antes de guardar
usuarioSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const Usuario = mongoose.model("Usuario", usuarioSchema);

// CREATE - Registrar usuario
app.post("/usuarios", async (req, res) => {
  try {
    // Verificar si el usuario ya existe
    const existe = await Usuario.findOne({ email: req.body.email });
    if (existe) {
      return res
        .status(400)
        .json({ success: false, message: "El correo ya está registrado" });
    }

    const nuevoUsuario = new Usuario(req.body);
    await nuevoUsuario.save();

    // Convertir a objeto y eliminar password de la respuesta
    const usuarioRespuesta = nuevoUsuario.toObject();
    delete usuarioRespuesta.password;

    res.status(201).json({
      success: true,
      message: "Usuario creado exitosamente",
      usuario: usuarioRespuesta,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al crear usuario" });
  }
});

// READ - Listar todos los usuarios
app.get("/usuarios", async (req, res) => {
  try {
    const usuarios = await Usuario.find().select("-password");
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
    const usuario = await Usuario.findById(req.params.id).select("-password");
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
    // Si se envía una contraseña, se encriptará por el pre-save hook 
    // pero findByIdAndUpdate no activa hooks por defecto de la misma forma que .save()
    // Para simplificar y asegurar consistencia, usaremos el método save si hay cambio de contraseña
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    const usuario = await Usuario.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).select("-password");

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
app.listen(PORT, () =>
  console.log(`Servidor escuchando en http://localhost:${PORT}`),
);
