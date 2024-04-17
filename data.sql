CREATE DATABASE IRCTC;
USE IRCTC;


-- train details

CREATE TABLE Train_Details (
    Train_Number INT,
    Number_of_Days INT,
    Current_Running_Day INT,
    Arrival_Time TIME,
    Departure_Time TIME,
    primary key(Train_Number)
);

INSERT INTO Train_Details (Train_Number, Number_of_Days, Current_Running_Day, Arrival_Time, Departure_Time) VALUES
    ('1234', 2, 1, '08:00:00', '14:00:00'),
    ('2345', 3, 2, '10:00:00', '16:00:00'),
    ('3456', 4, 3, '12:00:00', '18:00:00'),
    ('4567', 1, 1, '14:00:00', '20:00:00'),
    ('5678', 2, 2, '16:00:00', '22:00:00'),
    ('6789', 3, 3, '18:00:00', '00:00:00'),
    ('7890', 4, 4, '20:00:00', '02:00:00'),
    ('8901', 1, 1, '22:00:00', '04:00:00'),
    ('9012', 2, 2, '00:00:00', '06:00:00'),
    ('0123', 3, 3, '02:00:00', '08:00:00');

CREATE TABLE Passenger_details (
    Passenger_name VARCHAR(255),
    PNR INT(7) UNSIGNED,
    Train_number INT,
    Coach ENUM('A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10', 'A11'),
    Seat_number INT(2),
    PRIMARY KEY (PNR),
    foreign key(Train_number) References Train_Details(Train_Number)
);

-- Insert random data into Passenger_details table
INSERT INTO Passenger_Details (Passenger_Name, PNR, Train_Number, Coach, Seat_Number) VALUES
    ('John Doe', 1234567, 1234, 'A1', 10),
    ('Alice Smith', 2345678, 2345, 'A2', 20),
    ('Bob Johnson', 3456789, 3456, 'A3', 30),
    ('Emily Brown', 4567890, 4567, 'A4', 40),
    ('Michael Wilson', 5678901, 5678, 'A5', 50),
    ('Sophia Martinez', 6789012, 6789, 'A6', 60),
    ('William Taylor', 7890123, 7890, 'A7', 1),
    ('Olivia Anderson', 8901234, 8901, 'A8', 2),
    ('James Jackson', 9012345, 9012, 'A9', 3),
    ('Emma White', 0123456, 0123, 'A10', 4);


-- Pantry login

CREATE TABLE Pantry_Details (
    Train_Number INT,
    Pantry_Password VARCHAR(20),
    primary key(Train_Number),
    foreign key(Train_Number) References Train_Details(Train_Number)
);

INSERT INTO Pantry_Details (Train_Number, Pantry_Password) VALUES
    (1234, 'password1'),
    (2345, 'pantry@123'),
    (3456, 'secure$123'),
    (4567, 'pantry*pass'),
    (5678, '1234@pantry'),
    (6789, 'password@789'),
    (7890, 'pantry#456'),
    (8901, 'secure123'),
    (9012, 'pantry_password'),
    (0123, 'trainpantry');




-- lunch and dinner menu 

CREATE TABLE Lunch_Menu (
    Item VARCHAR(50),
    Price INT
);

CREATE TABLE Dinner_Menu (
    Item VARCHAR(50),
    Price INT
);

-- Inserting data into Lunch_Menu table
INSERT INTO Lunch_Menu (Item, Price) VALUES
    ('Vegetable Biryani', 200),
    ('Butter Chicken', 300),
    ('Paneer Tikka Masala', 250),
    ('Chicken Tikka', 280),
    ('Dal Makhani', 150),
    ('Mutton Rogan Josh', 350),
    ('Aloo Gobi', 180),
    ('Fish Curry', 320),
    ('Chole Bhature', 170),
    ('Egg Fried Rice', 220);

-- Inserting data into Dinner_Menu table
INSERT INTO Dinner_Menu (Item, Price) VALUES
    ('Tandoori Chicken', 280),
    ('Palak Paneer', 230),
    ('Chicken Biryani', 320),
    ('Baingan Bharta', 200),
    ('Rajma Chawal', 180),
    ('Fish Fry', 300),
    ('Prawn Curry', 350),
    ('Mushroom Masala', 220),
    ('Veg Pulao', 200),
    ('Chicken Korma', 300);


-- transaction table

CREATE TABLE Orders (
    Order_ID INT,
    PNR INT(7) UNSIGNED,
    Total_Items INT,
    Total_Amount INT,
    Meal varchar(6),
    primary key(Order_ID),
    foreign key(PNR) References Passenger_Details(PNR)
);

CREATE TABLE TOrders(
	Order_ID INT,
	Selected_Options JSON,
	foreign key(Order_ID) References Orders(Order_ID)
);

-- cart

CREATE TABLE Cart(
	PNR INT(7) UNSIGNED,
	Total_Items INT,
    Total_Amount INT,
    Selected_Options VARCHAR(1000),
    foreign key(PNR) References Passenger_Details(PNR)
);


select * from Orders;
select * from TOrders;



delete from TOrders where Order_ID = 1;
delete from Orders where PNR = 1234567;

SELECT TOrders.Order_ID,Passenger_details.Passenger_name, Passenger_details.Coach, Passenger_details.Seat_number,Orders.Meal ,TOrders.Selected_Options
FROM Pantry_Details
INNER JOIN Passenger_details ON Pantry_Details.Train_Number = Passenger_details.Train_Number
INNER JOIN Orders ON Passenger_details.PNR = Orders.PNR
INNER JOIN TOrders ON Orders.Order_ID = TOrders.Order_ID
WHERE Pantry_Details.Train_Number = 1234 
ORDER BY Order_ID;





