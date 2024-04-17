const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const path = require("path");
const PDFDocument = require("pdfkit");
const fs = require("fs");

const app = express();
const port = 3000;

let Pnr = 0;
let options = "";
let o_id = 1;
let ti = 0;
let ta = 0;

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Sql#2003",
  database: "IRCTC",
});

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

app.get("/options", (req, res) => {
  pnrNumber = parseInt(req.query.pnr);
  const timestamp = new Date();
  const hours = timestamp.getHours();
  Pnr = pnrNumber;
  var q = `select COUNT(*) as count from Passenger_details where PNR = ${Pnr}`;
  db.query(q, function (error1, results1, fields1) {
    if (results1[0].count == 1) {
      q = `DELETE FROM Cart where PNR = ${Pnr}`;
      db.query(q, function (error2, results2, fields2) {
        res.render("options", { hours });
      });
    } else {
      res.render("login", { msg: 1 });
    }
  });
});

app.get("/lunch", (req, res) => {
  var q = `select * from Lunch_Menu`;
  options = "lunch";
  db.query(q, function (error1, results1, fields1) {
    res.render("lunch", { menu: results1, Pno: Pnr });
  });
});

app.get("/add-to-cart", (req, res) => {
  const itemName = req.query.Item;
  const quantity = parseInt(req.query.quantity);
  const amount = parseInt(req.query.amount);
  var cost = quantity * amount;
  var q = `select COUNT(*) as count from Cart where PNR = ${Pnr} and Selected_Options = '${itemName}'`;
  db.query(q, function (error1, results1, fields1) {
    count = parseInt(results1[0].count);
    if (count) {
      q = `select Total_Items,Total_Amount from Cart where PNR = ${Pnr} and Selected_Options = '${itemName}'`;
      db.query(q, function (error2, results2, fields2) {
        itemNo = results2[0].Total_Items;
        qty = itemNo + quantity;
        am = cost + results2[0].Total_Amount;
        q = `Update Cart SET Total_Items = ${qty}, Total_Amount = ${am} where PNR = ${Pnr} and Selected_Options = '${itemName}'`;
        db.query(q, function (error3, results3, fields3) {
          if (options === "dinner") {
            q = `select * from Dinner_Menu`;
          } else {
            q = `select * from Lunch_Menu`;
          }
          db.query(q, function (error3, results3, fields3) {
            if (options === "dinner") {
              res.render("dinner", {
                menu: results3,
                Pno: Pnr,
              });
            } else {
              res.render("lunch", {
                menu: results3,
                Pno: Pnr,
              });
            }
          });
        });
      });
    } else {
      q = `INSERT INTO Cart VALUES(${Pnr},${quantity},${cost},'${itemName}')`;
      db.query(q, function (error2, results2, fields2) {
        if (options === "dinner") {
          q = `select * from Dinner_Menu`;
        } else {
          q = `select * from Lunch_Menu`;
        }
        db.query(q, function (error3, results3, fields3) {
          if (options === "dinner") {
            res.render("dinner", {
              menu: results3,
              Pno: Pnr,
            });
          } else {
            res.render("lunch", {
              menu: results3,
              Pno: Pnr,
            });
          }
        });
      });
    }
  });
});

app.get("/dinner", (req, res) => {
  options = "dinner";
  var q = `select * from Dinner_Menu`;
  db.query(q, function (error1, results1, fields1) {
    res.render("dinner", {
      menu: results1,
      Pno: Pnr,
    });
  });
});

app.get("/update-cart", (req, res) => {
  const itemsno = parseInt(req.query.quantity);
  const amount = parseInt(req.query.amount);
  const oldno = parseInt(req.query.oldno);
  const option = req.query.selectedOptions;
  const cost = amount / oldno;
  const ucost = cost * itemsno;
  var q = `Update Cart SET Total_Items = ${itemsno}, Total_Amount = ${ucost} where PNR = ${Pnr} and Selected_Options = '${option}'`;
  db.query(q, function (error1, results1, fields1) {
    q = `select * from Cart where PNR = ${Pnr}`;
    db.query(q, function (error2, results2, fields2) {
      res.render("cart", { cart: results2 });
    });
  });
});

app.get("/delete-from-cart", (req, res) => {
  const option = req.query.selectedOptions;
  var q = `DELETE from Cart where PNR = ${Pnr} and Selected_Options = '${option}'`;
  db.query(q, function (error1, results1, fields1) {
    q = `select * from Cart where PNR = ${Pnr}`;
    db.query(q, function (error2, results2, fields2) {
      res.render("cart", { cart: results2 });
    });
  });
});

app.get("/cart", (req, res) => {
  q = `select * from Cart where PNR = ${Pnr}`;
  db.query(q, function (error1, results1, fields1) {
    res.render("cart", {
      cart: results1,
    });
  });
});

app.get("/menu", (req, res) => {
  if (options === "dinner") {
    var q = `select * from Dinner_Menu`;
    db.query(q, function (error1, results1, fields1) {
      res.render("dinner", {
        menu: results1,
        Pno: Pnr,
      });
    });
  } else {
    var q = `select * from Lunch_Menu`;
    options = "lunch";
    db.query(q, function (error1, results1, fields1) {
      res.render("lunch", { menu: results1, Pno: Pnr });
    });
  }
});

app.get("/checkout", (req, res) => {
  var q = `Select * from Cart Where PNR = ${Pnr}`;
  db.query(q, function (error1, results1, fields1) {
    cart = results1;
    for (let i = 0; i < cart.length; i++) {
      ti += cart[i].Total_Items;
      ta += cart[i].Total_Amount;
    }
    q = `INSERT INTO Orders VALUES(${o_id},${Pnr},${ti},${ta},'${options}')`;
    db.query(q, function (error2, results2, fields2) {
      for (let i = 0; i < cart.length; i++) {
        q = `INSERT INTO TOrders VALUES(${o_id},'{"Food":"${cart[i].Selected_Options}","Qty":${cart[i].Total_Items},"Amount":${cart[i].Total_Amount}}')`;
        db.query(q, function (error3, results3, fields3) {});
      }
      q = `DELETE FROM Cart WHERE PNR = ${Pnr}`;
      db.query(q, function (error3, results3, fields3) {});
      o_id++;
      ti = 0;
      ta = 0;
      res.render("payment");
    });
  });
});

app.get("/download-bill", (req, res) => {
  const doc = new PDFDocument();
  let o = o_id - 1;
  const stream = doc.pipe(fs.createWriteStream("bill.pdf"));
  doc.fontSize(18).text("Order Details\n\n", { align: "center" });
  let totalAmount = 0;
  var q = `Select * from TOrders where Order_ID = ${o}`;
  doc.fontSize(16).text(`Order ID: ${o}`);
  doc.fontSize(12).text("\n\n");
  db.query(q, function (error1, results1, fields1) {
    orders = results1;
    for (let i = 0; i < orders.length; i++) {
      const temp = orders[i].Selected_Options;
      doc.fontSize(12).text(`Food: ${temp.Food}`);
      doc.fontSize(12).text(`Qty: ${temp.Qty}`);
      doc.fontSize(12).text(`Amount: ${temp.Amount}`);
      doc.fontSize(12).text("\n\n");
      totalAmount += temp.Amount;
    }
    doc.fontSize(16).text(`Total Amount: ${totalAmount}`);
    doc.fontSize(12).text();
    doc.end();
    stream.on("finish", () => {
      res.download("bill.pdf", "bill.pdf", (err) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error downloading the bill");
        }
        fs.unlink("bill.pdf", (err) => {
          if (err) {
            console.error(err);
          }
        });
      });
    });
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
