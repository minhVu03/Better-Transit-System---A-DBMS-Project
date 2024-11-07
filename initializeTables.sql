DROP TABLE Route;
DROP TABLE StopAt;
DROP TABLE BelongsTo;
DROP TABLE Contains;
DROP TABLE TripsPlan1;
DROP TABLE TripsPlan2;
DROP TABLE Feedback;
DROP TABLE Submit;
DROP TABLE Receive;
DROP TABLE Stops;
DROP TABLE Operator;
DROP TABLE Drive;
DROP TABLE Vehicles;
DROP TABLE Bus1;
DROP TABLE Bus2;
DROP TABLE Train1;
DROP TABLE Train2;
DROP TABLE Tram1;
DROP TABLE Tram1;
DROP TABLE PaymentMethod;
DROP TABLE SelectPayment;


CREATE TABLE Route (
routeNumber int PRIMARY KEY
);

CREATE TABLE Vehicles (
licensePlateNumber char(6) PRIMARY KEY,
capacity int,
carbonEmission Decimal(5,2),
startTime date,
VIN int);

CREATE TABLE Stops (
stopID int PRIMARY KEY,
address char(20),
maxCapacity int,
name char(20)
);

CREATE TABLE StopAt (
licensePlateNumber char(6),
stopID int,
PRIMARY KEY (licensePlateNumber, stopID),
FOREIGN KEY (stopID) REFERENCES Stops ON DELETE CASCADE,
FOREIGN KEY (licensePlateNumber) REFERENCES Vehicles ON DELETE CASCADE
);

CREATE TABLE BelongsTo (
routeNumber int,
stopID int,
PRIMARY KEY (routeNumber, stopID),
FOREIGN KEY (routeNumber) REFERENCES Route ON DELETE CASCADE,
FOREIGN KEY (stopID) REFERENCES Stops ON DELETE CASCADE
);

CREATE ASSERTION routeBelongsTo CHECK
(NOT EXISTS ((SELECT routeNumber FROM Route)
              EXCEPT
              (SELECT routeNumber FROM BelongsTo)))

CREATE ASSERTION stopBelongsTo CHECK
(NOT EXISTS ((SELECT stopID FROM Stops)
              EXCEPT
              (SELECT stopID FROM BelongsTo)))

CREATE TABLE Contains (
routeNumber int,
departureLocation VARCHAR,
arrivalLocation VARCHAR,
startTime date,
customerID int,
PRIMARY KEY (routeNumber, departureLocation, arrivalLocation, startTime, customerID),
FOREIGN KEY (routeNumber) REFERENCES Route ON DELETE CASCADE,
FOREIGN KEY (departureLocation, arrivalLocation, startTime) REFERENCES TripsPlan1 ON DELETE CASCADE,
FOREIGN KEY (departureLocation, arrivalLocation, startTime) REFERENCES TripsPlan2 ON DELETE CASCADE
);

CREATE TABLE TripsPlan1 (
departureLocation VARCHAR,
arrivalLocation VARCHAR,
startTime date,
duration int,
PRIMARY KEY (departureLocation, arrivalLocation, startTime),
FOREIGN KEY (departureLocation, arrivalLocation, startTime) REFERENCES TripsPlan2 ON DELETE CASCADE
);

CREATE TABLE TripsPlan2 (
departureLocation VARCHAR,
arrivalLocation VARCHAR,
startTime date,
customerID int,
PRIMARY KEY (customerID, arrivalLocation, startTime, departureLocation),
FOREIGN KEY (departureLocation, arrivalLocation, startTime) REFERENCES TripsPlan1 ON DELETE CASCADE,
FOREIGN KEY (customerID) REFERENCES Customers ON DELETE CASCADE
);

CREATE ASSERTION totalTrips1 CHECK
(NOT EXISTS ((SELECT departureLocation, arrivalLocation, startTime FROM TripsPlan1)
              EXCEPT
             (SELECT departureLocation, arrivalLocation, startTime FROM Contains)))

CREATE ASSERTION totalTrips1 CHECK
(NOT EXISTS ((SELECT departureLocation, arrivalLocation, startTime FROM TripsPlan2)
              EXCEPT
             (SELECT departureLocation, arrivalLocation, startTime FROM Contains)))


CREATE TABLE GoesOn (
routeNumber int,
licensePlateNumber char(6),
PRIMARY KEY (routeNumber, licensePlateNumber),
FOREIGN KEY (routeNumber) REFERENCES Route ON DELETE CASCADE
);

CREATE TABLE Feedback (
feedbackID int PRIMARY KEY,
starRating int,
comment char(120),
timeOfFeedback date
);

CREATE ASSERTION feedbackSubmit CHECK
(NOT EXISTS ((SELECT feedbackID FROM Feedback)
              EXCEPT
             (SELECT feedbackID FROM Submit)))

CREATE TABLE People (
customerID int PRIMARY KEY,
name VARCHAR,
transitCardNumber int UNIQUE
);

CREATE TABLE Rides (
customerID int,
routeNumber int,
licencePlateNumber int,
fare Decimal(3,2),
PRIMARY KEY (customerID, routeNumber, licensePlateNumber),
FOREIGN KEY (customerID) REFERENCES People ON DELETE CASCADE,
FOREIGN KEY (routeNumber) REFERENCES Route ON DELETE CASCADE
);

CREATE TABLE Submit (
customerID int,
feedbackID int,
PRIMARY KEY (customerID, feedbackID),
FOREIGN KEY (customerID) REFERENCES Customers ON DELETE CASCADE,
FOREIGN KEY (feedbackID) REFERENCES Feedback ON DELETE CASCADE
);

CREATE TABLE Receive (
feedbackID int,
employeeID int,
PRIMARY KEY (feedbackID, employeeID),
FOREIGN KEY (feedbackID) REFERENCES Feedback ON DELETE CASCADE,
FOREIGN KEY (employeeID) REFERENCES Employee ON DELETE CASCADE
);

CREATE TABLE Operator (
employeeID int PRIMARY KEY,
driverLicenseNumber int,
name VARCHAR
);

CREATE TABLE Drive (
licensePlateNumber char(6),
employeeID int,
timeOfOperation date,
PRIMARY KEY (licensePlateNumber, employeeID),
FOREIGN KEY (employeeID) REFERENCES Operator ON DELETE CASCADE
);

CREATE TABLE Vehicles (
licensePlateNumber char(6) PRIMARY KEY,
capacity int,
carbonEmission Decimal(5,2),
VIN int UNIQUE
);

CREATE TABLE Bus1 (
gas/km Decimal(5, 2) PRIMARY KEY,
carbonEmission Decimal(5, 2),
);

CREATE TABLE Bus2 (
gas/km Decimal(5, 2),
maxCapacity integer,
licensePlateNumber PRIMARY KEY,
VIN integer,
FOREIGN KEY (gas/km) REFERENCES Bus1 ON DELETE CASCADE,
FOREIGN KEY (licensePlateNumber) REFERENCES Vehicles ON DELETE CASCADE
);

CREATE TABLE Train1 (
electricity/km Decimal(5, 2) PRIMARY KEY,
carbonEmission Decimal(5, 2)
);

CREATE TABLE Train2 (
licensePlateNumber char(6) PRIMARY KEY,
electricity/km Decimal(5, 2),
maxCapacity Integer,
VIN integer,
FOREIGN KEY (electricity/km) REFERENCES Train1 ON DELETE CASCADE,
FOREIGN KEY (licensePlatNumberNumber) REFERENCES Vehicles ON DELETE CASCADE
);

CREATE TABLE Tram1 (
electricityUsage/km Decimal(5, 2),
carbonEmission Decimal(5, 2),
gas/km Decimal(5, 2),
PRIMARY KEY (electricityUsage, gas/km)
);

CREATE TABLE Tram2 (
licensePlateNumber PRIMARY KEY,
electricityUsage/km Decimal(5, 2),
gas/km Decimal(5, 2),
maxCapacity integer,
VIN integer,
FOREIGN KEY (electricityUsage/km) REFERENCES Tram1 ON DELETE CASCADE,
FOREIGN KEY (gas/km) REFERENCES Tram1 ON DELETE CASCADE,
FOREIGN KEY (licensePlateNumber) REFERENCES Vehicles ON DELETE CASCADE
);

CREATE TABLE PaymentMethod (
cardNumber int PRIMARY KEY
);

CREATE TABLE SelectPayment (
cardNumber int,
customerIDNumber int,
PRIMARY KEY (cardNumber, customerIDNumber),
FOREIGN KEY (cardNumber) REFERENCES PaymentMethod ON DELETE CASCADE,
FOREIGN KEY (customerIDNumber) REFERENCES People ON DELETE CASCADE
);

