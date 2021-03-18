const functions = require("firebase-functions");

const app = require("express")();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:8100");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Headers",
      "Authorization, X-API-KEY, Origin,"+
      "X-Requested-With, Content-Type, Accept,"+
      "Access-Control-Allow-Request-Method, Access-Control-Allow-Credentials");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.header("Allow", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});

const server = require("http").createServer(app);

const io = require("socket.io")(server, {
  allowEIO3: true,
  cors: {
    origin: "http://localhost:8100",
    credentials: true,
  },
});
const usuarios = [
  {
    nombre: "admin",
  },
];

io.on("connection", (socket) => {
  let newUser = "";

  socket.on("disconnect", function() {
    eliminarUsuario(newUser);
    console.log("Usuario Retirado");
    io.emit("users-changed", {user: socket.username, event: "left"});
  });

  socket.on("set-name", (name) => {
    newUser = name + "_" + usuarios.length;
    usuarios.push({nombre: newUser});
    socket.username = name;
    console.log("Usuario Conectado"+newUser);
    io.emit("users-changed",
        {user: name, onlineusers: usuarios.length, event: "joined"});
  });

  socket.on("send-message", (message) => {
    console.log(message);
    io.emit("message", {msg: message.text,
      user: socket.username, createdAt: new Date()});
  });
});

/**
 * Eliminar un usuario.
 * @param {string} val recibe un usuario.
 */
function eliminarUsuario(val) {
  for (let i=0; i<usuarios.length; i++) {
    for (let i=0; i<usuarios.length; i++) {
      if (usuarios[i].nombre== val) {
        usuarios.splice(i, 1);
        break;
      }
    }
  }
}

const port = process.env.PORT || 3004;

server.listen(port, function() {
  console.log("listening in http://localhost:" + port);
});


exports.app=functions.https.onRequest(app);
