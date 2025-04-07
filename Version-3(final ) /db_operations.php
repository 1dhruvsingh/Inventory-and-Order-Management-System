<?php

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "sioms_db";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

function executeQuery($sql) {
    global $conn;
    $result = $conn->query($sql);
    if (!$result) {
        die("Query failed: " . $conn->error);
    }
    return $result;
}

function getJSONResponse($data) {
    header('Content-Type: application/json');
    echo json_encode($data);
}

// Handle different operations
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $operation = $_POST['operation'];
    switch ($operation) {
        case 'get_products':
            $result = executeQuery("SELECT * FROM products");
            $products = [];
            while($row = $result->fetch_assoc()) {
                $products[] = $row;
            }
            getJSONResponse($products);
            break;

        case 'add_product':
            $data = json_decode(file_get_contents('php://input'), true);
            $sql = "INSERT INTO products (name, sku, price, stock) VALUES ('".$data['name']."','".$data['sku']."','".$data['price']."','".$data['stock']."')";
            executeQuery($sql);
            getJSONResponse(['status' => 'success']);
            break;

        // Add more cases for other operations
    }
}

$conn->close();
?>