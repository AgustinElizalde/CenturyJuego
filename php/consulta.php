<?php
    $ruta = new mysqli ("localhost","root","","videojuego"); 
    $ruta -> set_charset("utf8"); 

    $name = $_POST["usuario"];

    $sql = "INSERT INTO `jugador` (`Nombre`) VALUES ('$name')";

$consulta = mysqli_query($ruta,$sql);


if($consulta) {
    echo"Nombre guardado con exito";
    header("Location: ../paginas/eleccion.html");
}
else {
    echo "Algo salio mal" . mysqli_error($ruta);
}

mysqli_close($ruta); 

?>