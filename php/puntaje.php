<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "videojuego";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

$puntaje = $_POST['puntaje'];

$sql = "INSERT INTO puntuacion (Puntuacion) VALUES ('$puntaje')";

if ($conn->query($sql) === TRUE) {
    echo "Puntaje guardado correctamente";
} else {
    echo "Error al guardar el puntaje: " . $conn->error;
}

// Cerrar la conexión
$conn->close();
?>
