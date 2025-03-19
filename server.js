
const express = require('express');
const path = require('path');
const mysql = require('mysql');
const app = express();
const port = 3000;

// Configuración de la conexión a la base de datos MySQL
const db = mysql.createConnection({
  host: 'databaserg.cley2mo8q00o.us-east-2.rds.amazonaws.com', // Reemplaza con el endpoint de tu RDS
  user: 'admin', // Reemplaza con tu usuario de MySQL
  password: 'root1002468632', // Reemplaza con tu contraseña de MySQL
  database: 'Store1' // Reemplaza con el nombre de tu base de datos
});

// Conectar a la base de datos
db.connect((err) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
    return;
  }
  console.log('Conectado a la base de datos MySQL');
});

// Configurar el motor de plantillas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Servir archivos estáticos desde el directorio 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para servir el archivo index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para mostrar los datos de la base de datos
app.get('/data', (req, res) => {
  db.query('SELECT * FROM Customers', (err, results) => {
    if (err) {
      console.error('Error realizando la consulta:', err);
      res.status(500).send('Error en la consulta');
      return;
    }
    res.render('data', { customers: results });
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}/`);
});