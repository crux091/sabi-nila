USE StudentAppDB;
GO

-- Seed Civil Status
INSERT INTO CivilStatus_M (CivilStatus) VALUES ('Single'), ('Married'), ('Widowed'), ('Separated');

-- Seed Region
INSERT INTO Region_M (Region) VALUES ('NCR'), ('Region IV-A'), ('Region III');

-- Seed Sex
INSERT INTO Sex_M (Sex) VALUES ('Male'), ('Female');

-- Seed Suffix
INSERT INTO Suffix_M (Suffix) VALUES ('Jr.'), ('Sr.'), ('III'), ('IV');
