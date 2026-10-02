-- Create Database
CREATE DATABASE StudentAppDB;
GO

USE StudentAppDB;
GO

-- ==========================================
-- MASTER TABLES (Lookup tables)
-- ==========================================

CREATE TABLE Campus_M (
    CampusID INT PRIMARY KEY IDENTITY(1,1),
    Campus VARCHAR(200) NOT NULL
);

CREATE TABLE Department (
    DepartmentID INT PRIMARY KEY IDENTITY(1,1),
    DepartmentName VARCHAR(150) NOT NULL,
    DepartmentCode VARCHAR(20) NOT NULL
);

CREATE TABLE Region_M (
    RegionID INT PRIMARY KEY IDENTITY(1,1),
    Region VARCHAR(200) NOT NULL
);

CREATE TABLE CivilStatus_M (
    CivilStatusID INT PRIMARY KEY IDENTITY(1,1),
    CivilStatus VARCHAR(50) NOT NULL
);

CREATE TABLE Sex_M (
    SexID INT PRIMARY KEY IDENTITY(1,1),
    Sex VARCHAR(20) NOT NULL
);

CREATE TABLE Suffix_M (
    SuffixID INT PRIMARY KEY IDENTITY(1,1),
    Suffix VARCHAR(50) NOT NULL
);

CREATE TABLE Income_M (
    TotalHouseholdIncomeID INT PRIMARY KEY IDENTITY(1,1),
    TotalHouseholdIncome DECIMAL(18,2) NOT NULL
);

CREATE TABLE ParentsEducAttainment_M (
    ParentsEducAttainmentID INT PRIMARY KEY IDENTITY(1,1),
    ParentsEducAttainment VARCHAR(200) NOT NULL
);

CREATE TABLE CitizenshipStatus_M (
    CitizenshipStatusID INT PRIMARY KEY IDENTITY(1,1),
    CitizenshipStatus VARCHAR(200) NOT NULL
);

CREATE TABLE LivingArrangement_M (
    LivingArrangementID INT PRIMARY KEY IDENTITY(1,1),
    LivingArrangement VARCHAR(100) NOT NULL
);

CREATE TABLE ParentsMaritalStatus_M (
    ParentsMaritalStatusID INT PRIMARY KEY IDENTITY(1,1),
    ParentsMaritalStatus VARCHAR(100) NOT NULL
);

CREATE TABLE SchoolType_M (
    SchoolTypeID INT PRIMARY KEY IDENTITY(1,1),
    SchoolType VARCHAR(50) NOT NULL
);

CREATE TABLE SchoolOrg_M (
    SchoolOrganizationID INT PRIMARY KEY IDENTITY(1,1),
    NameOfSchoolOrganization VARCHAR(MAX) NOT NULL
);

CREATE TABLE CommunityOrg_M (
    CommunityOrganizationID INT PRIMARY KEY IDENTITY(1,1),
    NameOfCommunityOrganization VARCHAR(MAX) NOT NULL
);

-- ==========================================
-- MAIN ENTITIES
-- ==========================================

CREATE TABLE [User] (
    UserID INT PRIMARY KEY IDENTITY(1,1),
    Username VARCHAR(20) NOT NULL UNIQUE,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Password VARCHAR(100) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE Program (
    ProgramID INT PRIMARY KEY IDENTITY(1,1),
    Program VARCHAR(150) NOT NULL,
    DepartmentID INT FOREIGN KEY REFERENCES Department(DepartmentID)
);

CREATE TABLE Instructor (
    InstructorID INT PRIMARY KEY IDENTITY(1,1),
    EmployeeNo VARCHAR(50) UNIQUE NOT NULL,
    FullName VARCHAR(100) NOT NULL,
    DepartmentID INT FOREIGN KEY REFERENCES Department(DepartmentID),
    Email VARCHAR(100)
);

CREATE TABLE Subject (
    SubjectID INT PRIMARY KEY IDENTITY(1,1),
    SubjectCode VARCHAR(20) UNIQUE NOT NULL,
    SubjectName VARCHAR(100) NOT NULL,
    Units INT NOT NULL,
    DepartmentID INT FOREIGN KEY REFERENCES Department(DepartmentID)
);

CREATE TABLE Student (
    StudentID INT PRIMARY KEY IDENTITY(1,1),
    StudentNo VARCHAR(20) UNIQUE NOT NULL,
    CampusID INT FOREIGN KEY REFERENCES Campus_M(CampusID),
    ProgramID INT FOREIGN KEY REFERENCES Program(ProgramID),
    DateRegistered DATETIME DEFAULT GETDATE(),
    UserID INT UNIQUE FOREIGN KEY REFERENCES [User](UserID)
);

CREATE TABLE Enrollment (
    EnrollmentID INT PRIMARY KEY IDENTITY(1,1),
    StudentNo VARCHAR(20) FOREIGN KEY REFERENCES Student(StudentNo),
    SubjectID INT FOREIGN KEY REFERENCES Subject(SubjectID),
    InstructorID INT FOREIGN KEY REFERENCES Instructor(InstructorID),
    AcademicYear VARCHAR(20),
    Semester VARCHAR(20),
    YearSection VARCHAR(20),
    EnrollmentDate DATETIME DEFAULT GETDATE()
);

-- ==========================================
-- STUDENT APPLICATION FORMS
-- ==========================================

CREATE TABLE GeneralInformation (
    StudentID INT PRIMARY KEY IDENTITY(1,1),
    StudentNo VARCHAR(20) FOREIGN KEY REFERENCES Student(StudentNo),
    YearSection VARCHAR(50),
    LastName VARCHAR(50),
    FirstName VARCHAR(50),
    MiddleName VARCHAR(50),
    SuffixID INT FOREIGN KEY REFERENCES Suffix_M(SuffixID),
    SexID INT FOREIGN KEY REFERENCES Sex_M(SexID),
    Age INT,
    CivilStatusID INT FOREIGN KEY REFERENCES CivilStatus_M(CivilStatusID),
    Religion VARCHAR(100),
    RegionID INT FOREIGN KEY REFERENCES Region_M(RegionID),
    LanguageSpoken VARCHAR(100),
    IndigenousGroup VARCHAR(100),
    CurrentResidence NVARCHAR(MAX),
    PresentAddress NVARCHAR(MAX),
    PermanentAddress NVARCHAR(MAX),
    ContactNo VARCHAR(20),
    Email VARCHAR(100),
    FBLink VARCHAR(100)
);

CREATE TABLE FamilyBackground (
    FamilyID INT PRIMARY KEY IDENTITY(1,1),
    StudentNo VARCHAR(20) FOREIGN KEY REFERENCES Student(StudentNo),
    ParentsMaritalStatusID INT FOREIGN KEY REFERENCES ParentsMaritalStatus_M(ParentsMaritalStatusID),
    LivingArrangementID INT FOREIGN KEY REFERENCES LivingArrangement_M(LivingArrangementID),
    MotherName VARCHAR(150),
    FatherName VARCHAR(150),
    MotherBirthdate DATE,
    FatherBirthdate DATE,
    MotherCitizenshipID INT FOREIGN KEY REFERENCES CitizenshipStatus_M(CitizenshipStatusID),
    FatherCitizenshipID INT FOREIGN KEY REFERENCES CitizenshipStatus_M(CitizenshipStatusID),
    MotherOccupation NVARCHAR(100),
    FatherOccupation NVARCHAR(100),
    MotherHighestEducationalAttainmentID INT FOREIGN KEY REFERENCES ParentsEducAttainment_M(ParentsEducAttainmentID),
    FatherHighestEducationalAttainmentID INT FOREIGN KEY REFERENCES ParentsEducAttainment_M(ParentsEducAttainmentID),
    MotherContactNo VARCHAR(20),
    FatherContactNo VARCHAR(20),
    MotherEmailAddress VARCHAR(100),
    FatherEmailAddress VARCHAR(100),
    LegalGuardian VARCHAR(150),
    CompletePermanentAddress NVARCHAR(MAX),
    NumberOfSiblings INT,
    BirthOrder INT,
    TotalHouseholdIncomeID INT FOREIGN KEY REFERENCES Income_M(TotalHouseholdIncomeID),
    FourPsMember INT -- or BIT based on usage
);

CREATE TABLE Sibling (
    SiblingID INT PRIMARY KEY IDENTITY(1,1),
    StudentNo VARCHAR(20) FOREIGN KEY REFERENCES Student(StudentNo),
    SiblingName VARCHAR(150),
    SiblingAge INT,
    SiblingOccupation NVARCHAR(100),
    SiblingSchoolCompany NVARCHAR(MAX),
    SiblingContactNo VARCHAR(20)
);

CREATE TABLE EducationalBackground (
    EducationID INT PRIMARY KEY IDENTITY(1,1),
    StudentNo VARCHAR(20) FOREIGN KEY REFERENCES Student(StudentNo),
    ElementarySchoolName VARCHAR(100),
    ElementarySchoolAddress NVARCHAR(MAX),
    ElementarySchoolTypeID INT FOREIGN KEY REFERENCES SchoolType_M(SchoolTypeID),
    JuniorHighSchoolName VARCHAR(100),
    JuniorHighSchoolAddress NVARCHAR(MAX),
    JuniorHighSchoolTypeID INT FOREIGN KEY REFERENCES SchoolType_M(SchoolTypeID),
    SeniorHighSchoolName VARCHAR(100),
    SeniorHighSchoolAddress NVARCHAR(MAX),
    SeniorHighSchoolTypeID INT FOREIGN KEY REFERENCES SchoolType_M(SchoolTypeID),
    AwardsReceived NVARCHAR(MAX),
    Scholarships NVARCHAR(MAX),
    Employed BIT
);

CREATE TABLE MedicalBackground (
    MedicalID INT PRIMARY KEY IDENTITY(1,1),
    StudentNo VARCHAR(20) FOREIGN KEY REFERENCES Student(StudentNo),
    Height DECIMAL(5,2),
    Weight DECIMAL(5,2),
    PWD BIT,
    PWDIDNo VARCHAR(50),
    DisabilityType NVARCHAR(MAX),
    ReceivedTherapyCounselingTreatment BIT,
    CurrentMedicalPsychologicalCondition NVARCHAR(100),
    Medications NVARCHAR(MAX)
);

CREATE TABLE OtherInformation (
    OtherInfoID INT PRIMARY KEY IDENTITY(1,1),
    StudentNo VARCHAR(20) FOREIGN KEY REFERENCES Student(StudentNo),
    SpecialInterests NVARCHAR(MAX),
    SkillsTalents NVARCHAR(MAX),
    HobbiesRecreationalActivities NVARCHAR(MAX),
    AmbitionGoals NVARCHAR(MAX),
    GuidingPrinciples NVARCHAR(MAX),
    DistinctPersonalityTrait NVARCHAR(MAX),
    EntranceExamResult BIT,
    LatestGPA FLOAT
);

CREATE TABLE SchoolAffiliation (
    SchoolAffiliationID INT PRIMARY KEY IDENTITY(1,1),
    StudentNo VARCHAR(20) FOREIGN KEY REFERENCES Student(StudentNo),
    NameOfSchoolOrganizationID INT FOREIGN KEY REFERENCES SchoolOrg_M(SchoolOrganizationID),
    PositionHeld VARCHAR(150),
    Year VARCHAR(20)
);

CREATE TABLE CommunityAffiliation (
    CommunityAffiliationID INT PRIMARY KEY IDENTITY(1,1),
    StudentNo VARCHAR(20) FOREIGN KEY REFERENCES Student(StudentNo),
    NameOfCommunityOrganizationID INT FOREIGN KEY REFERENCES CommunityOrg_M(CommunityOrganizationID),
    PositionHeld VARCHAR(150),
    Year VARCHAR(20)
);
