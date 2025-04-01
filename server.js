const express = require('express');
const path = require('path');
const mysql = require('mysql');
const bodyParser = require('body-parser');
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

// Configurar body-parser para manejar datos POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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

// Ruta para agregar un nuevo cliente
app.post('/add-customer', (req, res) => {
  const { CustomerName, CustomerEmail, CustomerPhone, Address } = req.body;
  const sql = 'INSERT INTO Customers (CustomerName, CustomerEmail, CustomerPhone, Address) VALUES (?, ?, ?, ?)';
  db.query(sql, [CustomerName, CustomerEmail, CustomerPhone, Address], (err, result) => {
    if (err) {
      console.error('Error insertando datos:', err);
      res.status(500).send('Error insertando datos');
      return;
    }
    console.log('Registro insertado:', result.insertId);
    res.send('Cliente agregado exitosamente');
  });
});

// Ruta para mostrar la lista de productos en la tienda
app.get('/tienda', (req, res) => {
  db.query('SELECT * FROM Products', (err, results) => {
    if (err) {
      console.error('Error realizando la consulta:', err);
      res.status(500).send('Error en la consulta');
      return;
    }
    res.render('tienda', { products: results });
  });
});

// Ruta para mostrar los detalles de un producto específico
app.get('/producto/:id', (req, res) => {
  const productId = req.params.id;

  // Consulta para obtener el producto y sus imágenes
  const sql = `
    SELECT p.ProductID, p.ProductName, p.ProductDescription, p.Price, p.Stock, pi.ImageURL
    FROM Products p
    LEFT JOIN ProductImages pi ON p.ProductID = pi.ProductID
    WHERE p.ProductID = ?`;

  db.query(sql, [productId], (err, results) => {
    if (err) {
      console.error('Error realizando la consulta:', err);
      res.status(500).send('Error en la consulta');
      return;
    }

    if (results.length === 0) {
      res.status(404).send('Producto no encontrado');
      return;
    }

    // El primer resultado contiene los datos del producto
    const product = {
      ProductID: results[0].ProductID,
      ProductName: results[0].ProductName,
      ProductDescription: results[0].ProductDescription,
      Price: results[0].Price,
      Stock: results[0].Stock,
      Images: results.map(row => row.ImageURL) // Extrae todas las URLs de imágenes
    };

    res.render('producto', { product });
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}/`);
});