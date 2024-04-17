const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");

const app = express();
const port = 8080;

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Sql#2003",
  database: "IRCTC",
});

trainNum = 0;
passw = "";

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("Connected to MySQL");
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use("/styles", express.static(path.join(__dirname, "styles")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.render("login", { msg: 0 });
});

app.get("/orders", (req, res) => {
  const trainNumber = parseInt(req.query.trainNumber);
  const password = req.query.password;
  trainNum = trainNumber;
  passw = password;
  var q = `SELECT COUNT(*) as count FROM Pantry_Details where Train_Number = ${trainNumber} and Pantry_Password = '${password}'`;
  db.query(q, function (error1, results1, fields1) {
    if (results1[0].count == 1) {
      q1 = `SELECT TOrders.Order_ID,Passenger_details.Passenger_name, Passenger_details.Coach, Passenger_details.Seat_number,Orders.Meal ,TOrders.Selected_Options
      FROM Pantry_Details
      INNER JOIN Passenger_details ON Pantry_Details.Train_Number = Passenger_details.Train_Number
      INNER JOIN Orders ON Passenger_details.PNR = Orders.PNR
      INNER JOIN TOrders ON Orders.Order_ID = TOrders.Order_ID
      WHERE Pantry_Details.Train_Number = ${trainNumber}
      ORDER BY Order_ID`;
      db.query(q1, function (error2, results2, fields2) {
        res.render("orders", {
          order: results2,
          trainNo: trainNum,
          pass: passw,
        });
      });
    } else {
      res.render("login", { msg: 1 });
    }
  });
});

app.get("/delete-order", (req, res) => {
  const ID = req.query.OrderID;
  q = `DELETE FROM TOrders WHERE Order_ID = ${ID}`;
  db.query(q, function (error1, results1, fields1) {
    q = `SELECT TOrders.Order_ID,Passenger_details.Passenger_name, Passenger_details.Coach, Passenger_details.Seat_number,Orders.Meal ,TOrders.Selected_Options
      FROM Pantry_Details
      INNER JOIN Passenger_details ON Pantry_Details.Train_Number = Passenger_details.Train_Number
      INNER JOIN Orders ON Passenger_details.PNR = Orders.PNR
      INNER JOIN TOrders ON Orders.Order_ID = TOrders.Order_ID
      WHERE Pantry_Details.Train_Number = ${trainNum}
      ORDER BY Order_ID`;
    db.query(q, function (error2, results2, fields2) {
      res.render("orders", {
        order: results2,
        trainNo: trainNum,
        pass: passw,
      });
    });
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
