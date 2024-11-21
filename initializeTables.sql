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
DROP TABLE PaymentMethod CASCADE CONSTRAINTS;
DROP TABLE SelectPayment CASCADE CONSTRAINTS;



CREATE TABLE TransitRoute (
routeNumber int PRIMARY KEY
);

CREATE TABLE Vehicles (
licensePlateNumber char(6) PRIMARY KEY,
capacity int,
carbonEmission NUMBER(5,2),
startTime date,
VIN int UNIQUE);

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

CREATE TABLE TripsPlan2 (
    departureLocation VARCHAR(255),
    arrivalLocation VARCHAR(255),
    startTime date,
    customerID int,
    PRIMARY KEY (customerID, arrivalLocation, startTime, departureLocation),
    FOREIGN KEY (customerID) REFERENCES People (customerID) ON DELETE CASCADE
);

CREATE TABLE TripsPlan1 (
    departureLocation VARCHAR(255),
    arrivalLocation VARCHAR(255),
    startTime date,
    duration int,
    customerID int,
    PRIMARY KEY (departureLocation, arrivalLocation, startTime, customerID),
    FOREIGN KEY (departureLocation, arrivalLocation, startTime, customerID) 
        REFERENCES TripsPlan2 (departureLocation, arrivalLocation, startTime, customerID) ON DELETE CASCADE
);



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
licensePlateNumber char(6),
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
electricityUsage_km NUMBER(5, 2) PRIMARY KEY,
carbonEmission NUMBER(5, 2)
);

CREATE TABLE Train2 (
licensePlateNumber char(6) PRIMARY KEY,
electricityUsage_km NUMBER(5, 2),
maxCapacity Integer,
VIN integer,
FOREIGN KEY (electricityUsage_km) REFERENCES Train1 ON DELETE CASCADE,
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





INSERT INTO TransitRoute (routeNumber) VALUES (99);
INSERT INTO TransitRoute (routeNumber) VALUES (84);
INSERT INTO TransitRoute (routeNumber) VALUES (1);
INSERT INTO TransitRoute (routeNumber) VALUES (352);
INSERT INTO TransitRoute (routeNumber) VALUES (68);

-- Vehicles that are buses
INSERT INTO Vehicles (licensePlateNumber, capacity, carbonEmission, startTime, VIN) 
VALUES ('ABC123', 50, 120.50, TO_DATE('2024-11-15', 'YYYY-MM-DD'), 123456);
INSERT INTO Vehicles (licensePlateNumber, capacity, carbonEmission, startTime, VIN) 
VALUES ('QPC485', 60, 130.75, TO_DATE('2024-11-16', 'YYYY-MM-DD'), 098765);
INSERT INTO Vehicles (licensePlateNumber, capacity, carbonEmission, startTime, VIN) 
VALUES ('JD9876', 45, 110.20, TO_DATE('2024-11-17', 'YYYY-MM-DD'), 345678);
INSERT INTO Vehicles (licensePlateNumber, capacity, carbonEmission, startTime, VIN) 
VALUES ('CD5678', 55, 125.30, TO_DATE('2024-11-18', 'YYYY-MM-DD'), 234567);
INSERT INTO Vehicles (licensePlateNumber, capacity, carbonEmission, startTime, VIN) 
VALUES ('EF9012', 40, 105.15, TO_DATE('2024-11-19', 'YYYY-MM-DD'), 234677);
-- Vehicles that are trains
INSERT INTO Vehicles (licensePlateNumber, capacity, carbonEmission, startTime, VIN) 
VALUES ('SA3512', 50, 120.50, TO_DATE('2024-11-20', 'YYYY-MM-DD'), 12345);
INSERT INTO Vehicles (licensePlateNumber, capacity, carbonEmission, startTime, VIN) 
VALUES ('FB3451', 60, 130.75, TO_DATE('2024-11-21', 'YYYY-MM-DD'), 23456);
INSERT INTO Vehicles (licensePlateNumber, capacity, carbonEmission, startTime, VIN) 
VALUES ('FC4574', 45, 110.20, TO_DATE('2024-11-22', 'YYYY-MM-DD'), 34567);
INSERT INTO Vehicles (licensePlateNumber, capacity, carbonEmission, startTime, VIN) 
VALUES ('QD2564', 55, 125.30, TO_DATE('2024-11-23', 'YYYY-MM-DD'), 45678);
INSERT INTO Vehicles (licensePlateNumber, capacity, carbonEmission, startTime, VIN) 
VALUES ('PE1235', 40, 105.15, TO_DATE('2024-11-24', 'YYYY-MM-DD'), 56789);
-- Vehicles that are trams
INSERT INTO Vehicles (licensePlateNumber, capacity, carbonEmission, startTime, VIN) 
VALUES ('SD3512', 20, 150.30, TO_DATE('2024-11-25', 'YYYY-MM-DD'), 112233);
INSERT INTO Vehicles (licensePlateNumber, capacity, carbonEmission, startTime, VIN) 
VALUES ('FG3451', 25, 140.75, TO_DATE('2024-11-26', 'YYYY-MM-DD'), 445566);
INSERT INTO Vehicles (licensePlateNumber, capacity, carbonEmission, startTime, VIN) 
VALUES ('FG4574', 30, 160.20, TO_DATE('2024-11-27', 'YYYY-MM-DD'), 778899);
INSERT INTO Vehicles (licensePlateNumber, capacity, carbonEmission, startTime, VIN) 
VALUES ('QW2564', 35, 170.50, TO_DATE('2024-11-28', 'YYYY-MM-DD'), 101112);
INSERT INTO Vehicles (licensePlateNumber, capacity, carbonEmission, startTime, VIN) 
VALUES ('PL1235', 40, 180.25, TO_DATE('2024-11-29', 'YYYY-MM-DD'), 121314);




INSERT INTO Stops (stopID, stopAddress, maxCapacity, stopName) VALUES (101, '123 Main St', 50, 'Waterfront');
INSERT INTO Stops (stopID, stopAddress, maxCapacity, stopName) VALUES (305, '456 Elm St', 60, 'UBC');
INSERT INTO Stops (stopID, stopAddress, maxCapacity, stopName) VALUES (7, '789 Oak St', 40, 'Production-Way');
INSERT INTO Stops (stopID, stopAddress, maxCapacity, stopName) VALUES (104, '321 Pine St', 70, 'VCC-Clark');
INSERT INTO Stops (stopID, stopAddress, maxCapacity, stopName) VALUES (105, '654 Cedar St', 30, 'Main Street');

INSERT INTO StopAt (licensePlateNumber, stopID) VALUES ('ABC123', 101);
INSERT INTO StopAt (licensePlateNumber, stopID) VALUES ('QPC485', 305);
INSERT INTO StopAt (licensePlateNumber, stopID) VALUES ('JD9876', 7);
INSERT INTO StopAt (licensePlateNumber, stopID) VALUES ('CD5678', 104);
INSERT INTO StopAt (licensePlateNumber, stopID) VALUES ('EF9012', 105);

INSERT INTO BelongsTo (routeNumber, stopID) VALUES (99, 101);
INSERT INTO BelongsTo (routeNumber, stopID) VALUES (84, 305);
INSERT INTO BelongsTo (routeNumber, stopID) VALUES (352, 7);
INSERT INTO BelongsTo (routeNumber, stopID) VALUES (1, 104);
INSERT INTO BelongsTo (routeNumber, stopID) VALUES (68, 105);

INSERT INTO People (customerID, peopleName, transitCardNumber) VALUES (1, 'Michael Jackson', 12345);
INSERT INTO People (customerID, peopleName, transitCardNumber) VALUES (2, 'John Smith', 67890);
INSERT INTO People (customerID, peopleName, transitCardNumber) VALUES (3, 'First Last', 11223);
INSERT INTO People (customerID, peopleName, transitCardNumber) VALUES (4, 'Apple Orange', 33445);
INSERT INTO People (customerID, peopleName, transitCardNumber) VALUES (5, 'Name Name', 55667);
INSERT INTO People (customerID, peopleName, transitCardNumber) VALUES (101, 'Michael Jackson', 66778);
INSERT INTO People (customerID, peopleName, transitCardNumber) VALUES (102, 'John Smith', 77889);
INSERT INTO People (customerID, peopleName, transitCardNumber) VALUES (103, 'First Last', 88991);
INSERT INTO People (customerID, peopleName, transitCardNumber) VALUES (104, 'Apple Orange', 99101);
INSERT INTO People (customerID, peopleName, transitCardNumber) VALUES (105, 'Name Name', 10111);

--Note: customerIDs in TripsPlans need to exist in the People table
INSERT INTO TripsPlan2 (departureLocation, arrivalLocation, startTime, customerID) 
VALUES ('C', 'D', TO_DATE('2024-09-10 20:10:00', 'YYYY-MM-DD HH24:MI:SS'), 101);
INSERT INTO TripsPlan2 (departureLocation, arrivalLocation, startTime, customerID) 
VALUES ('Metrotown', 'UBC', TO_DATE('2024-10-15 08:00:00', 'YYYY-MM-DD HH24:MI:SS'), 102);
INSERT INTO TripsPlan2 (departureLocation, arrivalLocation, startTime, customerID) 
VALUES ('VCC-Clark', 'UBC', TO_DATE('2024-10-15 12:00:00', 'YYYY-MM-DD HH24:MI:SS'), 103);
INSERT INTO TripsPlan2 (departureLocation, arrivalLocation, startTime, customerID) 
VALUES ('A', 'B', TO_DATE('2024-10-18 17:30:30', 'YYYY-MM-DD HH24:MI:SS'), 104);
INSERT INTO TripsPlan2 (departureLocation, arrivalLocation, startTime, customerID) 
VALUES ('H', 'I', TO_DATE('2024-10-19 23:00:00', 'YYYY-MM-DD HH24:MI:SS'), 105);

--Note: CustomerID in tripsplan1 must exist in tripsplan2 since tripsplan1 is referencing tripsplan2
INSERT INTO TripsPlan1 (departureLocation, arrivalLocation, startTime, duration, customerID) 
VALUES ('C', 'D', TO_DATE('2024-09-10 20:10:00', 'YYYY-MM-DD HH24:MI:SS'), 60, 101);
INSERT INTO TripsPlan1 (departureLocation, arrivalLocation, startTime, duration, customerID) 
VALUES ('Metrotown', 'UBC', TO_DATE('2024-10-15 08:00:00', 'YYYY-MM-DD HH24:MI:SS'), 70, 102);
INSERT INTO TripsPlan1 (departureLocation, arrivalLocation, startTime, duration, customerID) 
VALUES ('VCC-Clark', 'UBC', TO_DATE('2024-10-15 12:00:00', 'YYYY-MM-DD HH24:MI:SS'), 45, 103);
INSERT INTO TripsPlan1 (departureLocation, arrivalLocation, startTime, duration, customerID) 
VALUES ('A', 'B', TO_DATE('2024-10-18 17:30:30', 'YYYY-MM-DD HH24:MI:SS'), 8, 104);
INSERT INTO TripsPlan1 (departureLocation, arrivalLocation, startTime, duration, customerID) 
VALUES ('H', 'I', TO_DATE('2024-10-19 23:00:00', 'YYYY-MM-DD HH24:MI:SS'), 12, 105);

--Contains is referencing Tripsplan1 and 2 so customerID need to exist in those tables too
--Contains also references TransitRoute 
INSERT INTO Contains (routeNumber, departureLocation, arrivalLocation, startTime, customerID) 
VALUES (99, 'C', 'D', TO_DATE('2024-09-10 20:10:00', 'YYYY-MM-DD HH24:MI:SS'), 101);
INSERT INTO Contains (routeNumber, departureLocation, arrivalLocation, startTime, customerID) 
VALUES (1, 'Metrotown', 'UBC', TO_DATE('2024-10-15 08:00:00', 'YYYY-MM-DD HH24:MI:SS'), 102);
INSERT INTO Contains (routeNumber, departureLocation, arrivalLocation, startTime, customerID) 
VALUES (84, 'VCC-Clark', 'UBC', TO_DATE('2024-10-15 12:00:00', 'YYYY-MM-DD HH24:MI:SS'), 103);
INSERT INTO Contains (routeNumber, departureLocation, arrivalLocation, startTime, customerID) 
VALUES (352, 'A', 'B', TO_DATE('2024-10-18 17:30:30', 'YYYY-MM-DD HH24:MI:SS'), 104);
INSERT INTO Contains (routeNumber, departureLocation, arrivalLocation, startTime, customerID) 
VALUES (68, 'H', 'I', TO_DATE('2024-10-19 23:00:00', 'YYYY-MM-DD HH24:MI:SS'), 105);


INSERT INTO GoesOn (routeNumber, licensePlateNumber) VALUES ('99', 'ABC123');
INSERT INTO GoesOn (routeNumber, licensePlateNumber) VALUES ('84', 'QPC485');
INSERT INTO GoesOn (routeNumber, licensePlateNumber) VALUES ('352', 'CD5678');
INSERT INTO GoesOn (routeNumber, licensePlateNumber) VALUES ('1', 'EF9012');
INSERT INTO GoesOn (routeNumber, licensePlateNumber) VALUES ('68', 'JD9876');

INSERT INTO Feedback (feedbackID, starRating, feedbackComment, timeOfFeedback) VALUES (1, 5, 'Good service', TO_DATE('2024-10-01 10:00:00', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO Feedback (feedbackID, starRating, feedbackComment, timeOfFeedback) VALUES (2, 3, 'Okay ride', TO_DATE('2024-10-02 12:15:00', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO Feedback (feedbackID, starRating, feedbackComment, timeOfFeedback) VALUES (3, 1, 'Never riding again', TO_DATE('2024-10-03 14:30:00', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO Feedback (feedbackID, starRating, feedbackComment, timeOfFeedback) VALUES (4, 4, 'Smooth ride', TO_DATE('2024-10-05 16:45:00', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO Feedback (feedbackID, starRating, feedbackComment, timeOfFeedback) VALUES (5, 2, 'Late bus', TO_DATE('2024-10-06 18:00:00', 'YYYY-MM-DD HH24:MI:SS'));

INSERT INTO Rides (customerID, routeNumber, licensePlateNumber, fare) VALUES (1, 99, 'ABC123', 2.50);
INSERT INTO Rides (customerID, routeNumber, licensePlateNumber, fare) VALUES (2, 1, 'CD5678', 3.00);
INSERT INTO Rides (customerID, routeNumber, licensePlateNumber, fare) VALUES (3, 84, 'QPC485', 2.75);
INSERT INTO Rides (customerID, routeNumber, licensePlateNumber, fare) VALUES (4, 352, 'JD9876', 4.50);
INSERT INTO Rides (customerID, routeNumber, licensePlateNumber, fare) VALUES (5, 68, 'EF9012', 3.25);

INSERT INTO Submit (customerID, feedbackID) VALUES (1, 1);
INSERT INTO Submit (customerID, feedbackID) VALUES (2, 2);
INSERT INTO Submit (customerID, feedbackID) VALUES (3, 3);
INSERT INTO Submit (customerID, feedbackID) VALUES (4, 4);
INSERT INTO Submit (customerID, feedbackID) VALUES (5, 5);

INSERT INTO Operator (employeeID, driverLicenseNumber, operatorName) VALUES (1, 123456, 'Adam');
INSERT INTO Operator (employeeID, driverLicenseNumber, operatorName) VALUES (4, 111111, 'Bonnie');
INSERT INTO Operator (employeeID, driverLicenseNumber, operatorName) VALUES (3, 121212, 'Cameron');
INSERT INTO Operator (employeeID, driverLicenseNumber, operatorName) VALUES (2, 323232, 'Dane');
INSERT INTO Operator (employeeID, driverLicenseNumber, operatorName) VALUES (5, 198237, 'Erica');

INSERT INTO Receive (feedbackID, employeeID) VALUES (1, 5);
INSERT INTO Receive (feedbackID, employeeID) VALUES (2, 1);
INSERT INTO Receive (feedbackID, employeeID) VALUES (3, 2);
INSERT INTO Receive (feedbackID, employeeID) VALUES (4, 4);
INSERT INTO Receive (feedbackID, employeeID) VALUES (5, 3);

INSERT INTO Drive (licensePlateNumber, employeeID, timeOfOperation) 
VALUES ('ABC123', 3, TO_DATE('2024-09-10 20:10:00', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO Drive (licensePlateNumber, employeeID, timeOfOperation) 
VALUES ('CD5678', 2, TO_DATE('2024-10-15 08:00:00', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO Drive (licensePlateNumber, employeeID, timeOfOperation) 
VALUES ('QPC485', 1, TO_DATE('2024-10-15 12:00:00', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO Drive (licensePlateNumber, employeeID, timeOfOperation) 
VALUES ('JD9876', 4, TO_DATE('2024-10-18 17:30:30', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO Drive (licensePlateNumber, employeeID, timeOfOperation) 
VALUES ('EF9012', 5, TO_DATE('2024-10-19 23:00:00', 'YYYY-MM-DD HH24:MI:SS'));


INSERT INTO Bus1 (gas_km, carbonEmission) VALUES (8.50, 5.75);
INSERT INTO Bus1 (gas_km, carbonEmission) VALUES (10.50, 6.25);
INSERT INTO Bus1 (gas_km, carbonEmission) VALUES (7.50, 6.00);
INSERT INTO Bus1 (gas_km, carbonEmission) VALUES (6.00, 3.00);
INSERT INTO Bus1 (gas_km, carbonEmission) VALUES (10.00, 12.00);

INSERT INTO Bus2 (gas_km, maxCapacity, licensePlateNumber, VIN) VALUES (8.50, 60, 'ABC123', 123456);
INSERT INTO Bus2 (gas_km, maxCapacity, licensePlateNumber, VIN) VALUES (10.50, 50, 'CD5678', 234567);
INSERT INTO Bus2 (gas_km, maxCapacity, licensePlateNumber, VIN) VALUES (7.50, 40, 'JD9876', 345678);
INSERT INTO Bus2 (gas_km, maxCapacity, licensePlateNumber, VIN) VALUES (6.00, 30, 'EF9012', 234677);
INSERT INTO Bus2 (gas_km, maxCapacity, licensePlateNumber, VIN) VALUES (10.00, 100, 'QPC485', 098765);

--Check here if carbon emission is identical to vehicles, if not, need to add more in vehicles
INSERT INTO Train1 (electricityUsage_km, carbonEmission) VALUES (3.50, 4.00);
INSERT INTO Train1 (electricityUsage_km, carbonEmission) VALUES (5.50, 4.25);
INSERT INTO Train1 (electricityUsage_km, carbonEmission) VALUES (6.00, 5.00);
INSERT INTO Train1 (electricityUsage_km, carbonEmission) VALUES (7.00, 6.25);
INSERT INTO Train1 (electricityUsage_km, carbonEmission) VALUES (8.25, 10.00);

--Train2 references Train1 and Vehicles so the foreign keys must be identical
INSERT INTO Train2 (licensePlateNumber, electricityUsage_km, maxCapacity, VIN) VALUES ('SA3512', 3.50, 20, 12345);
INSERT INTO Train2 (licensePlateNumber, electricityUsage_km, maxCapacity, VIN) VALUES ('FB3451', 5.50, 25, 23456);
INSERT INTO Train2 (licensePlateNumber, electricityUsage_km, maxCapacity, VIN) VALUES ('FC4574', 6.00, 30, 34567);
INSERT INTO Train2 (licensePlateNumber, electricityUsage_km, maxCapacity, VIN) VALUES ('QD2564', 7.00, 35, 45678);
INSERT INTO Train2 (licensePlateNumber, electricityUsage_km, maxCapacity, VIN) VALUES ('PE1235', 8.25, 40, 56789);

INSERT INTO Tram1 (electricityUsage_km, carbonEmission, gas_km) VALUES (3.50, 4.00, 3.79);
INSERT INTO Tram1 (electricityUsage_km, carbonEmission, gas_km) VALUES (5.50, 4.25, 2.65);
INSERT INTO Tram1 (electricityUsage_km, carbonEmission, gas_km) VALUES (6.00, 5.00, 4.23);
INSERT INTO Tram1 (electricityUsage_km, carbonEmission, gas_km) VALUES (7.00, 6.25, 6.45);
INSERT INTO Tram1 (electricityUsage_km, carbonEmission, gas_km) VALUES (8.25, 10.00, 3.21);

INSERT INTO Tram2 (licensePlateNumber, electricityUsage_km, gas_km, maxCapacity, VIN) VALUES ('SD3512', 3.50, 3.79, 20, 112233);
INSERT INTO Tram2 (licensePlateNumber, electricityUsage_km, gas_km, maxCapacity, VIN) VALUES ('FG3451', 5.50, 2.65, 25, 445566);
INSERT INTO Tram2 (licensePlateNumber, electricityUsage_km, gas_km, maxCapacity, VIN) VALUES ('FG4574', 6.00, 4.23, 30, 778899);
INSERT INTO Tram2 (licensePlateNumber, electricityUsage_km, gas_km, maxCapacity, VIN) VALUES ('QW2564', 7.00, 6.45, 35, 101112);
INSERT INTO Tram2 (licensePlateNumber, electricityUsage_km, gas_km, maxCapacity, VIN) VALUES ('PL1235', 8.25, 3.21, 40, 121314);

INSERT INTO PaymentMethod (cardNumber) VALUES (12345);
INSERT INTO PaymentMethod (cardNumber) VALUES (67890);
INSERT INTO PaymentMethod (cardNumber) VALUES (11223);
INSERT INTO PaymentMethod (cardNumber) VALUES (33445);
INSERT INTO PaymentMethod (cardNumber) VALUES (55667);


INSERT INTO SelectPayment (cardNumber, customerIDNumber) VALUES (12345, 101);
INSERT INTO SelectPayment (cardNumber, customerIDNumber) VALUES (67890, 102);
INSERT INTO SelectPayment (cardNumber, customerIDNumber) VALUES (11223, 103);
INSERT INTO SelectPayment (cardNumber, customerIDNumber) VALUES (33445, 104);
INSERT INTO SelectPayment (cardNumber, customerIDNumber) VALUES (55667, 105);
