create table Movie {
    MovieID integer primary key,
    Title char(50),
    Year integer 
};

create table Author {
    AuthorID char(30) primary key,
    AuthorName char(50),
    MovieID integer REFERENCES MovieID.Movie ON DELETE CASCADE
    BirthYear integer 
};

create
