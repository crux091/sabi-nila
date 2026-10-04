-- StudentAppDB Schema Definition

CREATE DATABASE StudentAppDB;
GO
USE StudentAppDB;
GO

CREATE TABLE Campus_M (
    CampusID INT IDENTITY(1,1) PRIMARY KEY,
    Campus VARCHAR(200) NOT NULL);
GO

CREATE TABLE CitizenshipStatus_M (
    CitizenshipStatusID INT IDENTITY(1,1) PRIMARY KEY,
    CitizenshipStatus VARCHAR(200) NOT NULL);
GO

CREATE TABLE CivilStatus_M (
    CivilStatusID INT IDENTITY(1,1) PRIMARY KEY,
    CivilStatus VARCHAR(50) NOT NULL);
GO

CREATE TABLE CommunityAffiliation (
    CommunityAffiliationID INT IDENTITY(1,1) PRIMARY KEY,
    StudentNo VARCHAR(20),
    NameOfCommunityOrganizationID INT,
    PositionHeld VARCHAR(150),
    Year VARCHAR(20));
GO

CREATE TABLE CommunityOrg_M (
    CommunityOrganizationID INT IDENTITY(1,1) PRIMARY KEY,
    NameOfCommunityOrganization VARCHAR(MAX) NOT NULL);
GO

CREATE TABLE Department (
    DepartmentID INT IDENTITY(1,1) PRIMARY KEY,
    DepartmentName VARCHAR(150) NOT NULL,
    DepartmentCode VARCHAR(20) NOT NULL);
GO

CREATE TABLE EducationalBackground (
    EducationID INT IDENTITY(1,1) PRIMARY KEY,
    StudentNo VARCHAR(20),
    ElementarySchoolName VARCHAR(100),
    ElementarySchoolAddress NVARCHAR(MAX),
    ElementarySchoolTypeID INT,
    JuniorHighSchoolName VARCHAR(100),
    JuniorHighSchoolAddress NVARCHAR(MAX),
    JuniorHighSchoolTypeID INT,
    SeniorHighSchoolName VARCHAR(100),
    SeniorHighSchoolAddress NVARCHAR(MAX),
    SeniorHighSchoolTypeID INT,
    AwardsReceived NVARCHAR(MAX),
    Scholarships NVARCHAR(MAX),
    Employed BIT,
    StudentID INT);
GO

CREATE TABLE Enrollment (
    EnrollmentID INT IDENTITY(1,1) PRIMARY KEY,
    StudentNo VARCHAR(20),
    SubjectID INT,
    InstructorID INT,
    AcademicYear VARCHAR(20),
    Semester VARCHAR(20),
    YearSection VARCHAR(20),
    EnrollmentDate DATETIME,
    StudentID INT,
    Program VARCHAR(255),
    Campus VARCHAR(255),
    SubjectCode VARCHAR(50),
    SubjectName VARCHAR(255),
    Units INT,
    UserID INT);
GO

CREATE TABLE FamilyBackground (
    FamilyID INT IDENTITY(1,1) PRIMARY KEY,
    StudentNo VARCHAR(20),
    ParentsMaritalStatusID INT,
    LivingArrangementID INT,
    MotherName VARCHAR(150),
    FatherName VARCHAR(150),
    MotherBirthdate DATE,
    FatherBirthdate DATE,
    MotherCitizenshipID INT,
    FatherCitizenshipID INT,
    MotherOccupation NVARCHAR(100),
    FatherOccupation NVARCHAR(100),
    MotherHighestEducationalAttainmentID INT,
    FatherHighestEducationalAttainmentID INT,
    MotherContactNo VARCHAR(20),
    FatherContactNo VARCHAR(20),
    MotherEmailAddress VARCHAR(100),
    FatherEmailAddress VARCHAR(100),
    LegalGuardian VARCHAR(150),
    CompletePermanentAddress NVARCHAR(MAX),
    NumberOfSiblings INT,
    BirthOrder INT,
    TotalHouseholdIncomeID INT,
    FourPsMember INT,
    StudentID INT);
GO

CREATE TABLE GeneralInformation (
    StudentID INT IDENTITY(1,1) PRIMARY KEY,
    StudentNo VARCHAR(20),
    YearSection VARCHAR(50),
    LastName VARCHAR(50),
    FirstName VARCHAR(50),
    MiddleName VARCHAR(50),
    SuffixID INT,
    SexID INT,
    Age INT,
    CivilStatusID INT,
    Religion VARCHAR(100),
    RegionID INT,
    LanguageSpoken VARCHAR(100),
    IndigenousGroup VARCHAR(100),
    CurrentResidence NVARCHAR(MAX),
    PresentAddress NVARCHAR(MAX),
    PermanentAddress NVARCHAR(MAX),
    ContactNo VARCHAR(20),
    Email VARCHAR(100),
    FBLink VARCHAR(100));
GO

CREATE TABLE Income_M (
    TotalHouseholdIncomeID INT IDENTITY(1,1) PRIMARY KEY,
    TotalHouseholdIncome DECIMAL(18,2) NOT NULL);
GO

CREATE TABLE Instructor (
    InstructorID INT IDENTITY(1,1) PRIMARY KEY,
    EmployeeNo VARCHAR(50) NOT NULL,
    FullName VARCHAR(100) NOT NULL,
    DepartmentID INT,
    Email VARCHAR(100));
GO

CREATE TABLE LivingArrangement_M (
    LivingArrangementID INT IDENTITY(1,1) PRIMARY KEY,
    LivingArrangement VARCHAR(100) NOT NULL);
GO

CREATE TABLE MedicalBackground (
    MedicalID INT IDENTITY(1,1) PRIMARY KEY,
    StudentNo VARCHAR(20),
    Height DECIMAL(18,2),
    Weight DECIMAL(18,2),
    PWD BIT,
    PWDIDNo VARCHAR(50),
    DisabilityType NVARCHAR(MAX),
    ReceivedTherapyCounselingTreatment BIT,
    CurrentMedicalPsychologicalCondition NVARCHAR(100),
    Medications NVARCHAR(MAX),
    StudentID INT);
GO

CREATE TABLE OtherInformation (
    OtherInfoID INT IDENTITY(1,1) PRIMARY KEY,
    StudentNo VARCHAR(20),
    SpecialInterests NVARCHAR(MAX),
    SkillsTalents NVARCHAR(MAX),
    HobbiesRecreationalActivities NVARCHAR(MAX),
    AmbitionGoals NVARCHAR(MAX),
    GuidingPrinciples NVARCHAR(MAX),
    DistinctPersonalityTrait NVARCHAR(MAX),
    EntranceExamResult BIT,
    LatestGPA FLOAT,
    StudentID INT);
GO

CREATE TABLE ParentsEducAttainment_M (
    ParentsEducAttainmentID INT IDENTITY(1,1) PRIMARY KEY,
    ParentsEducAttainment VARCHAR(200) NOT NULL);
GO

CREATE TABLE ParentsMaritalStatus_M (
    ParentsMaritalStatusID INT IDENTITY(1,1) PRIMARY KEY,
    ParentsMaritalStatus VARCHAR(100) NOT NULL);
GO

CREATE TABLE Program (
    ProgramID INT IDENTITY(1,1) PRIMARY KEY,
    Program VARCHAR(150) NOT NULL,
    DepartmentID INT);
GO

CREATE TABLE Region_M (
    RegionID INT IDENTITY(1,1) PRIMARY KEY,
    Region VARCHAR(200) NOT NULL);
GO

CREATE TABLE SchoolAffiliation (
    SchoolAffiliationID INT IDENTITY(1,1) PRIMARY KEY,
    StudentNo VARCHAR(20),
    NameOfSchoolOrganizationID INT,
    PositionHeld VARCHAR(150),
    Year VARCHAR(20));
GO

CREATE TABLE SchoolOrg_M (
    SchoolOrganizationID INT IDENTITY(1,1) PRIMARY KEY,
    NameOfSchoolOrganization VARCHAR(MAX) NOT NULL);
GO

CREATE TABLE SchoolType_M (
    SchoolTypeID INT IDENTITY(1,1) PRIMARY KEY,
    SchoolType VARCHAR(50) NOT NULL);
GO

CREATE TABLE Sex_M (
    SexID INT IDENTITY(1,1) PRIMARY KEY,
    Sex VARCHAR(20) NOT NULL);
GO

CREATE TABLE Sibling (
    SiblingID INT IDENTITY(1,1) PRIMARY KEY,
    StudentNo VARCHAR(20),
    SiblingName VARCHAR(150),
    SiblingAge INT,
    SiblingOccupation NVARCHAR(100),
    SiblingSchoolCompany NVARCHAR(MAX),
    SiblingContactNo VARCHAR(20),
    StudentID INT);
GO

CREATE TABLE Student (
    StudentID INT IDENTITY(1,1) PRIMARY KEY,
    StudentNo VARCHAR(20) NOT NULL,
    CampusID INT,
    ProgramID INT,
    DateRegistered DATETIME,
    UserID INT);
GO

CREATE TABLE Subject (
    SubjectID INT IDENTITY(1,1) PRIMARY KEY,
    SubjectCode VARCHAR(20) NOT NULL,
    SubjectName VARCHAR(100) NOT NULL,
    Units INT NOT NULL,
    DepartmentID INT);
GO

CREATE TABLE Suffix_M (
    SuffixID INT IDENTITY(1,1) PRIMARY KEY,
    Suffix VARCHAR(50) NOT NULL);
GO

CREATE TABLE User (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Username VARCHAR(20) NOT NULL,
    Email VARCHAR(100) NOT NULL,
    Password VARCHAR(100) NOT NULL,
    CreatedAt DATETIME
);
GO
