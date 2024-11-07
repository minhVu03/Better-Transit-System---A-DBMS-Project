--create table Movie {
--    MovieID integer primary key,
--    Title char(50),
--    Year integer
--};
--
--create table Author {
--    AuthorID char(30) primary key,
--    AuthorName char(50),
--    MovieID integer REFERENCES MovieID.Movie ON DELETE CASCADE
--    BirthYear integer
--};

INSERT INTO Route (routeNumber) VALUES (99), (84), (1), (352), (68);

INSERT INTO StopAt (licensePlateNumber, stopID)
VALUES ('ABC123', 101), ('QPC485', 305),
       ('JD9876', 7), ('CD5678', 104),
       ('EF9012', 105);

INSERT INTO BelongsTo (routeNumber, stopID)
VALUES (99, 101), (84, 305),
       (352, 7), (1, 104),
       (68, 105);

INSERT INTO Contains (routeNumber, departureLocation, arrivalLocation, startTime, customerID)
VALUES (99, 'C', 'D', '2024-09-10 20:10:00', 123),
       (1, 'Metrotown', 'UBC', '2024-10-15 08:00:00', 164),
       (84, 'VCC-Clark', 'UBC', '2024-10-15 12:00:00', 737),
       (352, 'A', 'B', '2024-10-18 17:30:30', 670),
       (68, 'H', 'I', '2024-10-19 23:00:00', 438);

INSERT INTO TripsPlan1 (departureLocation, arrivalLocation, startTime, duration)
VALUES ('C', 'D', '2024-09-10 20:10:00', 60),
       ('Metrotown', 'UBC', '2024-10-15 08:00:00', 70),
       ('VCC-Clark', 'UBC', '2024-10-15 12:00:00', 45),
       ('A', 'B', '2024-10-18 17:30:30', 8),
       ('H', 'I', '2024-10-19 23:00:00', 12);


INSERT INTO TripsPlan2 (departureLocation, arrivalLocation, startTime, customerID)
VALUES ('C', 'D', '2024-09-10 20:10:00', 101),
       ('Metrotown', 'UBC', '2024-10-15 08:00:00', 102),
       ('VCC-Clark', 'UBC', '2024-10-15 12:00:00', 103),
       ('A', 'B', '2024-10-18 17:30:30', 104),
       ('H', 'I', '2024-10-19 23:00:00', 105);


INSERT INTO GoesOn(routeNumber, licensePlateNumber)
VALUES (‘99’, ‘ABC123’),
(‘84’, 'QPC485'),
(‘352’, 'CD5678'),
(‘1’, 'EF9012'),
(‘68’, 'JD9876')

INSERT INTO Feedback (feedbackID, starRating, comment, timeOfFeedback)
VALUES (1, 5, 'Good service', '2024-10-01 10:00:00'),
       (2, 3, 'Okay ride', '2024-10-02 12:15:00'),
       (3, 1, 'Never riding again', '2024-10-03 14:30:00'),
       (4, 4, 'Smooth ride', '2024-10-05 16:45:00'),
       (5, 2, 'Late bus', '2024-10-06 18:00:00');

INSERT INTO People (customerID, name, transitCardNumber)
VALUES (1,'Michael Jackson', 12345),
       (2, 'John Smith', 67890),
       (3, 'First Last', 11223),
       (4, 'Apple Orange', 33445),
       (5, 'Name Name', 55667);

INSERT INTO Rides (customerID, routeNumber, licencePlateNumber, fare)
VALUES (1, 99, 'ABC123', 2.50),
       (2, 1, 'CD5678', 3.00),
       (3, 84, 'QPC485', 2.75),
       (4, 352, 'JD9876', 4.50),
       (5, 68, 'EF9012', 3.25);

INSERT INTO Submit (customerID, feedbackID)
VALUES (1, 1),
       (2, 2),
       (3, 3),
       (4, 4),
       (5, 5);

INSERT INTO Receive (feedbackID, employeeID)
VALUES (1, 5),
       (2, 1),
       (3, 2),
       (4, 4),
       (5, 3);

INSERT INTO Stops (stopID, address, maxCapacity, name)
VALUES (101, '123 Main St', 50, 'Waterfront'),
       (305, '456 Elm St', 60, 'UBC'),
       (7, '789 Oak St', 40, 'Production-Way'),
       (104, '321 Pine St', 70, 'VCC-Clark', '104, 105'),
       (105, '654 Cedar St', 30, 'Main Street', '105');

INSERT INTO Operator (employeeID, driverLicenseNumber, name)
VALUES (1, 123456, 'Adam'),
       (4, 111111, 'Bonnie'),
       (3, 121212, 'Cameron'),
       (2, 323232, 'Dane'),
       (5, 198237, 'Erica');

INSERT INTO Drive (licensePlateNumber, employeeID, timeOfOperation)
VALUES ('ABC123', 3, '2024-09-10 20:10:00'),
       ('CD5678', 2, '2024-10-15 08:00:00'),
       ('QPC485', 1, '2024-10-15 12:00:00'),
       ('JD9876', 4, '2024-10-18 17:30:30'),
       ('EF9012', 5, '2024-10-19 23:00:00');

INSERT INTO Bus1 (gas/km, carbonEmission)
VALUES (8.50, 5.75),
(10.50, 6.25),
(7.50, 6.00),
(6.00, 3.00),
(10.00, 12.00);

INSERT INTO Bus2 (gas/km, maxCapacity, licensePlateNumber, VIN)
VALUES (8.50, 60, ‘ABC123’, 123456),
(10.50, 50, 'CD5678', 234567),
(7.50, 40, 'JD9876', 345678),
(6.00, 30, 'EF9012', 234677),
(10.00, 100, 'QPC485', 098765);

INSERT INTO Train1 (electricityUsage/km, carbonEmission)
VALUES (3.50, 4.00),
(5.50, 4.25),
(6.00, 5.00),
(7.00, 6.25),
(8.25, 10.00);

INSERT INTO Train2 (licensePlateNumber, electricityUsage/km, maxCapacity, VIN)
VALUES (‘SA3512’, 3.50, 20, 864734),
(‘FB3451’, 5.50, 25, 323455),
(‘FC4574’, 6.00, 30, 345734),
(‘QD2564’, 7.00, 35, 785684),
(‘PE1235’, 8.25, 40, 323497);

INSERT INTO Tram1 (electricityUsage/km, carbonEmission, gas/km)
VALUES (3.50, 4.00, 3.79),
(5.50, 4.25, 2.65),
(6.00, 5.00, 4.23),
(7.00, 6.25, 6.45),
(8.25, 10.00, 3.21);

INSERT INTO Tram2 (licensePlateNumber, electricityUsage/km, gas/km, maxCapacity, VIN)
VALUES (‘SD3512’, 3.50, 20, 3.79, 112233),
(‘FG3451’, 5.50, 25, 2.65, 445566),
(‘FG4574’, 6.00, 30, 4.23, 778899),
(‘QW2564’, 7.00, 35, 6.45, 101112),
(‘PL1235’, 8.25, 40, 3.21, 121314);

INSERT INTO PaymentMethod (cardNumber)
VALUES (12345), (67890), (11223), (33445), (55667);

INSERT INTO SelectPayment (cardNumber, customerIDNumber)
VALUES (12345, 101),
       (67890, 102),
       (11223, 103),
       (33445, 104),
       (55667, 105);
