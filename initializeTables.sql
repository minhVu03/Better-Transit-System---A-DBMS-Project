DROP TABLE TransitRoute CASCADE CONSTRAINTS;
DROP TABLE StopAt;
DROP TABLE BelongsTo;
DROP TABLE Contains;

DROP TABLE TripsPlan2 CASCADE CONSTRAINTS;
DROP TABLE TripsPlan1 CASCADE CONSTRAINTS;
DROP TABLE People CASCADE CONSTRAINTS;

DROP TABLE GoesOn CASCADE CONSTRAINTS;
DROP TABLE Rides;

DROP TABLE Feedback CASCADE CONSTRAINTS;
DROP TABLE Submit;
DROP TABLE Receive;
DROP TABLE Stops;
DROP TABLE Operator CASCADE CONSTRAINTS;
DROP TABLE Drive;
DROP TABLE Vehicles CASCADE CONSTRAINTS;
DROP TABLE Bus1 CASCADE CONSTRAINTS;
DROP TABLE Bus2;
DROP TABLE Train1 CASCADE CONSTRAINTS;
DROP TABLE Train2;
DROP TABLE Tram1 CASCADE CONSTRAINTS;
DROP TABLE Tram2;
DROP TABLE PaymentMethod;
DROP TABLE SelectPayment;



CREATE TABLE TransitRoute (
routeNumber int PRIMARY KEY
);

CREATE TABLE Vehicles (
licensePlateNumber char(6) PRIMARY KEY,
capacity int,
carbonEmission NUMBER(5,2),
startTime date,
VIN int);

CREATE TABLE Stops (
stopID int PRIMARY KEY,
stopAddress char(20),
maxCapacity int,
stopName char(20)
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
FOREIGN KEY (routeNumber) REFERENCES TransitRoute ON DELETE CASCADE,
FOREIGN KEY (stopID) REFERENCES Stops ON DELETE CASCADE
);

CREATE TABLE People (
    customerID int PRIMARY KEY,
    peopleName VARCHAR(255),
    transitCardNumber int
);

CREATE TABLE TripsPlan1 (
    departureLocation VARCHAR(255),
    arrivalLocation VARCHAR(255),
    startTime date,
    duration int,
    customerID int,
    PRIMARY KEY (departureLocation, arrivalLocation, startTime, customerID)
);

CREATE TABLE TripsPlan2 (
    departureLocation VARCHAR(255),
    arrivalLocation VARCHAR(255),
    startTime date,
    customerID int,
    PRIMARY KEY (customerID, arrivalLocation, startTime, departureLocation),
    FOREIGN KEY (departureLocation, arrivalLocation, startTime, customerID) 
        REFERENCES TripsPlan1 (departureLocation, arrivalLocation, startTime, customerID) ON DELETE CASCADE,
    FOREIGN KEY (customerID) REFERENCES People (customerID) ON DELETE CASCADE
);

-- circular reference isn't allowed here so im adding the foreign key reference for TripsPlan1
--- AFTER both tables have been created
ALTER TABLE TripsPlan1
ADD CONSTRAINT fk_tripsplan2
FOREIGN KEY (departureLocation, arrivalLocation, startTime, customerID)
REFERENCES TripsPlan2 (departureLocation, arrivalLocation, startTime, customerID)
ON DELETE CASCADE;


CREATE TABLE Contains (
    routeNumber INT,
    departureLocation VARCHAR2(255),
    arrivalLocation VARCHAR2(255),
    startTime DATE,
    customerID INT,
    PRIMARY KEY (routeNumber, departureLocation, arrivalLocation, startTime, customerID),
    FOREIGN KEY (routeNumber) REFERENCES TransitRoute (routeNumber) ON DELETE CASCADE,
    --References: should specify which specific attributes in the parent table. Or else error: invalid column type
    --referenced column types need to be consistent
    --errornous code had "REFERENCES TripsPlan1 ON DELETE CASCADE"
    FOREIGN KEY (departureLocation, arrivalLocation, startTime, customerID) 
        REFERENCES TripsPlan1 (departureLocation, arrivalLocation, startTime, customerID) ON DELETE CASCADE,
    FOREIGN KEY (departureLocation, arrivalLocation, startTime, customerID) 
        REFERENCES TripsPlan2 (departureLocation, arrivalLocation, startTime, customerID) ON DELETE CASCADE
);


CREATE TABLE GoesOn (
routeNumber int,
licensePlateNumber char(6),
PRIMARY KEY (routeNumber, licensePlateNumber),
FOREIGN KEY (routeNumber) REFERENCES TransitRoute ON DELETE CASCADE
);

--comment is a reserved keyword, changed to feedbackComment
CREATE TABLE Feedback (
feedbackID int PRIMARY KEY,
starRating int,
feedbackComment char(120),
timeOfFeedback date
);


CREATE TABLE Rides (
customerID int,
routeNumber int,
licensePlateNumber int,
fare NUMBER(3,2),
PRIMARY KEY (customerID, routeNumber, licensePlateNumber),
FOREIGN KEY (customerID) REFERENCES People ON DELETE CASCADE,
FOREIGN KEY (routeNumber) REFERENCES TransitRoute ON DELETE CASCADE
);

CREATE TABLE Submit (
customerID int,
feedbackID int,
PRIMARY KEY (customerID, feedbackID),
FOREIGN KEY (customerID) REFERENCES People ON DELETE CASCADE,
FOREIGN KEY (feedbackID) REFERENCES Feedback ON DELETE CASCADE
);

CREATE TABLE Operator (
employeeID int PRIMARY KEY,
driverLicenseNumber int,
operatorName VARCHAR(255)
);

CREATE TABLE Receive (
feedbackID int,
employeeID int,
PRIMARY KEY (feedbackID, employeeID),
FOREIGN KEY (feedbackID) REFERENCES Feedback ON DELETE CASCADE,
FOREIGN KEY (employeeID) REFERENCES Operator ON DELETE CASCADE
);


CREATE TABLE Drive (
licensePlateNumber char(6),
employeeID int,
timeOfOperation date,
PRIMARY KEY (licensePlateNumber, employeeID),
FOREIGN KEY (employeeID) REFERENCES Operator ON DELETE CASCADE
);

CREATE TABLE Bus1 (
gas_km NUMBER(5, 2) PRIMARY KEY,
carbonEmission NUMBER(5, 2)
);

CREATE TABLE Bus2 (
gas_km NUMBER(5, 2),
maxCapacity integer,
licensePlateNumber PRIMARY KEY,
VIN integer,
FOREIGN KEY (gas_km) REFERENCES Bus1 ON DELETE CASCADE,
FOREIGN KEY (licensePlateNumber) REFERENCES Vehicles ON DELETE CASCADE
);

CREATE TABLE Train1 (
electricity_km NUMBER(5, 2) PRIMARY KEY,
carbonEmission NUMBER(5, 2)
);

CREATE TABLE Train2 (
licensePlateNumber char(6) PRIMARY KEY,
electricity_km NUMBER(5, 2),
maxCapacity Integer,
VIN integer,
FOREIGN KEY (electricity_km) REFERENCES Train1 ON DELETE CASCADE,
FOREIGN KEY (licensePlateNumber) REFERENCES Vehicles ON DELETE CASCADE
);

CREATE TABLE Tram1 (
electricityUsage_km NUMBER(5, 2),
carbonEmission NUMBER(5, 2),
gas_km NUMBER(5, 2),
PRIMARY KEY (electricityUsage_km, gas_km)
);

CREATE TABLE Tram2 (
licensePlateNumber char(6) PRIMARY KEY,
electricityUsage_km NUMBER(5, 2),
gas_km NUMBER(5, 2),
maxCapacity integer,
VIN integer,
--cannot do Foreign keys electricityUsage_km and gas_km in two separate statements since they together
-- are a primary key in Tram1
FOREIGN KEY (electricityUsage_km, gas_km) REFERENCES Tram1 (electricityUsage_km, gas_km) ON DELETE CASCADE,
FOREIGN KEY (licensePlateNumber) REFERENCES Vehicles (licensePlateNumber) ON DELETE CASCADE
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