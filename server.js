const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const path = require('path');
// Serve HTML, CSS, JS directly from Express
app.use(express.static(path.join(__dirname, 'public')));

// ... rest of your server.js routes ...

// Redirect root to GeneralInformation.html
app.get('/', (req, res) => {
    res.redirect('/GeneralInformation.html');
});

// Database Connection Config
const dbConfig = {
    user: 'nodeuser', // Replace with your SQL username
    password: 'password123', // Replace with your SQL password
    server: 'localhost\\SQLEXPRESS', // Automatically target the SQLEXPRESS instance
    database: 'StudentAppDB',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

// Test Database Connection on Startup
sql.connect(dbConfig).then(pool => {
    console.log('✅ Successfully connected to SQL Server Database!');
    // Close the test connection since routes create their own pools
    pool.close();
}).catch(err => {
    console.error('❌ Failed to connect to SQL Server Database on startup!');
    console.error(err.message);
});

// 1. Save or Update General Information
app.post('/api/student/general', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        const data = req.body;

        let request = pool.request()
            .input('LastName', sql.NVarChar, data.LastName)
            .input('FirstName', sql.NVarChar, data.FirstName)
            .input('MiddleName', sql.NVarChar, data.MiddleName)
            .input('SuffixID', sql.Int, data.SuffixID ? parseInt(data.SuffixID) : null)
            .input('SexID', sql.Int, data.SexID ? parseInt(data.SexID) : null)
            .input('Age', sql.Int, data.Age)
            .input('CivilStatusID', sql.Int, data.CivilStatusID ? parseInt(data.CivilStatusID) : null)
            .input('Religion', sql.NVarChar, data.Religion)
            .input('RegionID', sql.Int, data.RegionID ? parseInt(data.RegionID) : null)
            .input('LanguageSpoken', sql.NVarChar, data.LanguageSpoken)
            .input('IndigenousGroup', sql.NVarChar, data.IndigenousGroup)
            .input('ContactNo', sql.NVarChar, data.ContactNo)
            .input('Email', sql.NVarChar, data.Email)
            .input('FBLink', sql.NVarChar, data.FBLink)
            .input('CurrentResidence', sql.NVarChar, data.CurrentResidence)
            .input('PresentAddress', sql.NVarChar, data.PresentAddress)
            .input('PermanentAddress', sql.NVarChar, data.PermanentAddress);

        if (data.StudentID) {
            // Update existing record
            request.input('StudentID', sql.Int, data.StudentID);
            await request.query(`
                UPDATE GeneralInformation SET 
                    LastName = @LastName, FirstName = @FirstName, MiddleName = @MiddleName, SuffixID = @SuffixID, SexID = @SexID, 
                    Age = @Age, CivilStatusID = @CivilStatusID, Religion = @Religion, RegionID = @RegionID, LanguageSpoken = @LanguageSpoken, 
                    IndigenousGroup = @IndigenousGroup, ContactNo = @ContactNo, Email = @Email, FBLink = @FBLink, 
                    CurrentResidence = @CurrentResidence, PresentAddress = @PresentAddress, PermanentAddress = @PermanentAddress
                WHERE StudentID = @StudentID
            `);
            res.json({ success: true, studentId: data.StudentID, message: 'General information updated!' });
        } else {
            // Insert new record
            let result = await request.query(`
                INSERT INTO GeneralInformation 
                (LastName, FirstName, MiddleName, SuffixID, SexID, Age, CivilStatusID, Religion, RegionID, LanguageSpoken, IndigenousGroup, ContactNo, Email, FBLink, CurrentResidence, PresentAddress, PermanentAddress)
                OUTPUT INSERTED.StudentID
                VALUES 
                (@LastName, @FirstName, @MiddleName, @SuffixID, @SexID, @Age, @CivilStatusID, @Religion, @RegionID, @LanguageSpoken, @IndigenousGroup, @ContactNo, @Email, @FBLink, @CurrentResidence, @PresentAddress, @PermanentAddress)
            `);
            res.json({ success: true, studentId: result.recordset[0].StudentID, message: 'General information saved!' });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 2. Fetch Student Data by ID
app.get('/api/student/:id', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        const studentId = req.params.id;

        const genRes = await pool.request().input('ID', sql.Int, studentId).query('SELECT * FROM GeneralInformation WHERE StudentID = @ID');

        if (genRes.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'Student ID not found' });
        }

        const famRes = await pool.request().input('StudentID', sql.Int, studentId).query('SELECT * FROM FamilyBackground WHERE StudentID = @StudentID');
        const eduRes = await pool.request().input('StudentID', sql.Int, studentId).query('SELECT * FROM EducationalBackground WHERE StudentID = @StudentID');
        const sibRes = await pool.request().input('StudentID', sql.Int, studentId).query('SELECT * FROM Sibling WHERE StudentID = @StudentID');
        const medRes = await pool.request().input('StudentID', sql.Int, studentId).query('SELECT * FROM MedicalBackground WHERE StudentID = @StudentID');
        const otherRes = await pool.request().input('StudentID', sql.Int, studentId).query('SELECT * FROM OtherInformation WHERE StudentID = @StudentID');
        const enrollRes = await pool.request().input('StudentID', sql.Int, studentId).query('SELECT * FROM Enrollment WHERE StudentID = @StudentID');

        res.json({
            success: true,
            general: genRes.recordset[0],
            family: famRes.recordset[0] || {},
            education: eduRes.recordset[0] || {},
            sibling: sibRes.recordset[0] || {},
            medical: medRes.recordset[0] || {},
            other: otherRes.recordset[0] || {},
            enrollment: enrollRes.recordset[0] || {}
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 2.2 Save or Update Family Background
app.post('/api/student/family', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        const data = req.body;
        if (!data.StudentID) return res.status(400).json({ success: false, error: 'StudentID is required' });

        // Check if FamilyBackground exists
        const famRes = await pool.request().input('StudentID', sql.Int, data.StudentID).query('SELECT FamilyID FROM FamilyBackground WHERE StudentID = @StudentID');

        let request = pool.request()
            .input('StudentID', sql.Int, data.StudentID)
            .input('MotherName', sql.VarChar, data.MotherName || null)
            .input('FatherName', sql.VarChar, data.FatherName || null)
            .input('MotherBirthdate', sql.Date, data.MotherBirthdate || null)
            .input('FatherBirthdate', sql.Date, data.FatherBirthdate || null)
            .input('MotherCitizenshipID', sql.Int, data.MotherCitizenshipID ? parseInt(data.MotherCitizenshipID) : null)
            .input('FatherCitizenshipID', sql.Int, data.FatherCitizenshipID ? parseInt(data.FatherCitizenshipID) : null)
            .input('MotherOccupation', sql.NVarChar, data.MotherOccupation || null)
            .input('FatherOccupation', sql.NVarChar, data.FatherOccupation || null)
            .input('MotherHighestEducationalAttainmentID', sql.Int, data.MotherHighestEducationalAttainmentID ? parseInt(data.MotherHighestEducationalAttainmentID) : null)
            .input('FatherHighestEducationalAttainmentID', sql.Int, data.FatherHighestEducationalAttainmentID ? parseInt(data.FatherHighestEducationalAttainmentID) : null)
            .input('MotherContactNo', sql.VarChar, data.MotherContactNo || null)
            .input('FatherContactNo', sql.VarChar, data.FatherContactNo || null)
            .input('MotherEmailAddress', sql.VarChar, data.MotherEmailAddress || null)
            .input('FatherEmailAddress', sql.VarChar, data.FatherEmailAddress || null)
            .input('ParentsMaritalStatusID', sql.Int, data.ParentsMaritalStatusID ? parseInt(data.ParentsMaritalStatusID) : null)
            .input('LivingArrangementID', sql.Int, data.LivingArrangementID ? parseInt(data.LivingArrangementID) : null)
            .input('FourPsMember', sql.Int, data.FourPsMember === '1' || data.FourPsMember === 'Yes' || data.FourPsMember === 'true' ? 1 : 0)
            .input('LegalGuardian', sql.VarChar, data.LegalGuardian || null)
            .input('CompletePermanentAddress', sql.NVarChar, data.CompletePermanentAddress || null)
            .input('NumberOfSiblings', sql.Int, data.NumberOfSiblings ? parseInt(data.NumberOfSiblings) : 0)
            .input('BirthOrder', sql.Int, data.BirthOrder ? parseInt(data.BirthOrder) : null)
            .input('TotalHouseholdIncomeID', sql.Int, data.TotalHouseholdIncomeID ? parseInt(data.TotalHouseholdIncomeID) : null);

        if (famRes.recordset.length > 0) {
            // Update
            await request.query(`
                UPDATE FamilyBackground SET 
                    MotherName = @MotherName, FatherName = @FatherName, MotherBirthdate = @MotherBirthdate, FatherBirthdate = @FatherBirthdate,
                    MotherCitizenshipID = @MotherCitizenshipID, FatherCitizenshipID = @FatherCitizenshipID, MotherOccupation = @MotherOccupation, FatherOccupation = @FatherOccupation,
                    MotherHighestEducationalAttainmentID = @MotherHighestEducationalAttainmentID, FatherHighestEducationalAttainmentID = @FatherHighestEducationalAttainmentID,
                    MotherContactNo = @MotherContactNo, FatherContactNo = @FatherContactNo, MotherEmailAddress = @MotherEmailAddress, FatherEmailAddress = @FatherEmailAddress,
                    ParentsMaritalStatusID = @ParentsMaritalStatusID, LivingArrangementID = @LivingArrangementID, FourPsMember = @FourPsMember,
                    LegalGuardian = @LegalGuardian, CompletePermanentAddress = @CompletePermanentAddress, 
                    NumberOfSiblings = @NumberOfSiblings, BirthOrder = @BirthOrder, TotalHouseholdIncomeID = @TotalHouseholdIncomeID
                WHERE StudentID = @StudentID
            `);
        } else {
            // Insert
            await request.query(`
                INSERT INTO FamilyBackground (StudentID, MotherName, FatherName, MotherBirthdate, FatherBirthdate, MotherCitizenshipID, FatherCitizenshipID, MotherOccupation, FatherOccupation, MotherHighestEducationalAttainmentID, FatherHighestEducationalAttainmentID, MotherContactNo, FatherContactNo, MotherEmailAddress, FatherEmailAddress, ParentsMaritalStatusID, LivingArrangementID, FourPsMember, LegalGuardian, CompletePermanentAddress, NumberOfSiblings, BirthOrder, TotalHouseholdIncomeID)
                VALUES (@StudentID, @MotherName, @FatherName, @MotherBirthdate, @FatherBirthdate, @MotherCitizenshipID, @FatherCitizenshipID, @MotherOccupation, @FatherOccupation, @MotherHighestEducationalAttainmentID, @FatherHighestEducationalAttainmentID, @MotherContactNo, @FatherContactNo, @MotherEmailAddress, @FatherEmailAddress, @ParentsMaritalStatusID, @LivingArrangementID, @FourPsMember, @LegalGuardian, @CompletePermanentAddress, @NumberOfSiblings, @BirthOrder, @TotalHouseholdIncomeID)
            `);
        }
        res.json({ success: true, studentId: data.StudentID, message: 'Family background saved!' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 2.3 Save or Update Educational Background
app.post('/api/student/education', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        const data = req.body;
        if (!data.StudentID) return res.status(400).json({ success: false, error: 'StudentID is required' });

        const eduRes = await pool.request().input('StudentID', sql.Int, data.StudentID).query('SELECT EducationID FROM EducationalBackground WHERE StudentID = @StudentID');

        let request = pool.request()
            .input('StudentID', sql.Int, data.StudentID)
            .input('ElementarySchoolName', sql.VarChar, data.ElementarySchoolName || null)
            .input('ElementarySchoolAddress', sql.NVarChar, data.ElementarySchoolAddress || null)
            .input('ElementarySchoolTypeID', sql.Int, data.ElementarySchoolTypeID ? parseInt(data.ElementarySchoolTypeID) : null)
            .input('JuniorHighSchoolName', sql.VarChar, data.JuniorHighSchoolName || null)
            .input('JuniorHighSchoolAddress', sql.NVarChar, data.JuniorHighSchoolAddress || null)
            .input('JuniorHighSchoolTypeID', sql.Int, data.JuniorHighSchoolTypeID ? parseInt(data.JuniorHighSchoolTypeID) : null)
            .input('SeniorHighSchoolName', sql.VarChar, data.SeniorHighSchoolName || null)
            .input('SeniorHighSchoolAddress', sql.NVarChar, data.SeniorHighSchoolAddress || null)
            .input('SeniorHighSchoolTypeID', sql.Int, data.SeniorHighSchoolTypeID ? parseInt(data.SeniorHighSchoolTypeID) : null)
            .input('AwardsReceived', sql.NVarChar, data.AwardsRecieved || data.AwardsReceived || null)
            .input('Scholarships', sql.NVarChar, data.Scholarships || null)
            .input('Employed', sql.Bit, data.Employed === '1' || data.Employed === 'Yes' || data.Employed === 'true' ? 1 : 0);

        if (eduRes.recordset.length > 0) {
            // Update
            await request.query(`
                UPDATE EducationalBackground SET 
                    ElementarySchoolName = @ElementarySchoolName, ElementarySchoolAddress = @ElementarySchoolAddress, ElementarySchoolTypeID = @ElementarySchoolTypeID,
                    JuniorHighSchoolName = @JuniorHighSchoolName, JuniorHighSchoolAddress = @JuniorHighSchoolAddress, JuniorHighSchoolTypeID = @JuniorHighSchoolTypeID,
                    SeniorHighSchoolName = @SeniorHighSchoolName, SeniorHighSchoolAddress = @SeniorHighSchoolAddress, SeniorHighSchoolTypeID = @SeniorHighSchoolTypeID,
                    AwardsReceived = @AwardsReceived, Scholarships = @Scholarships, Employed = @Employed
                WHERE StudentID = @StudentID
            `);
        } else {
            // Insert
            await request.query(`
                INSERT INTO EducationalBackground (StudentID, ElementarySchoolName, ElementarySchoolAddress, ElementarySchoolTypeID, JuniorHighSchoolName, JuniorHighSchoolAddress, JuniorHighSchoolTypeID, SeniorHighSchoolName, SeniorHighSchoolAddress, SeniorHighSchoolTypeID, AwardsReceived, Scholarships, Employed)
                VALUES (@StudentID, @ElementarySchoolName, @ElementarySchoolAddress, @ElementarySchoolTypeID, @JuniorHighSchoolName, @JuniorHighSchoolAddress, @JuniorHighSchoolTypeID, @SeniorHighSchoolName, @SeniorHighSchoolAddress, @SeniorHighSchoolTypeID, @AwardsReceived, @Scholarships, @Employed)
            `);
        }
        res.json({ success: true, studentId: data.StudentID, message: 'Educational background saved!' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 2.4 Save or Update Sibling
app.post('/api/student/sibling', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        const data = req.body;
        if (!data.StudentID) return res.status(400).json({ success: false, error: 'StudentID is required' });

        const sibRes = await pool.request().input('StudentID', sql.Int, data.StudentID).query('SELECT SiblingID FROM Sibling WHERE StudentID = @StudentID');

        let request = pool.request()
            .input('StudentID', sql.Int, data.StudentID)
            .input('SiblingName', sql.VarChar, data.SiblingName || null)
            .input('SiblingAge', sql.Int, data.SiblingAge ? parseInt(data.SiblingAge) : null)
            .input('SiblingContactNo', sql.VarChar, data.SiblingContactNo || null)
            .input('SiblingSchoolCompany', sql.NVarChar, data.SiblingSchoolCompany || null)
            .input('SiblingOccupation', sql.NVarChar, data.SiblingOccupation || null);

        if (sibRes.recordset.length > 0) {
            await request.query(`
                UPDATE Sibling SET 
                    SiblingName = @SiblingName, SiblingAge = @SiblingAge, SiblingContactNo = @SiblingContactNo, 
                    SiblingSchoolCompany = @SiblingSchoolCompany, SiblingOccupation = @SiblingOccupation
                WHERE StudentID = @StudentID
            `);
        } else {
            await request.query(`
                INSERT INTO Sibling (StudentID, SiblingName, SiblingAge, SiblingContactNo, SiblingSchoolCompany, SiblingOccupation)
                VALUES (@StudentID, @SiblingName, @SiblingAge, @SiblingContactNo, @SiblingSchoolCompany, @SiblingOccupation)
            `);
        }
        res.json({ success: true, studentId: data.StudentID, message: 'Sibling info saved!' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 2.5 Save or Update Medical Background
app.post('/api/student/medical', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        const data = req.body;
        if (!data.StudentID) return res.status(400).json({ success: false, error: 'StudentID is required' });

        const medRes = await pool.request().input('StudentID', sql.Int, data.StudentID).query('SELECT MedicalID FROM MedicalBackground WHERE StudentID = @StudentID');

        let request = pool.request()
            .input('StudentID', sql.Int, data.StudentID)
            .input('Height', sql.Decimal(5,2), data.Height || null)
            .input('Weight', sql.Decimal(5,2), data.Weight || null)
            .input('PWD', sql.Bit, data.PWD === '1' || data.PWD === 'Yes' || data.PWD === 'true' ? 1 : 0)
            .input('PWDIDNo', sql.VarChar, data.PWDID || null)
            .input('DisabilityType', sql.NVarChar, data.DisabilityType || null)
            .input('ReceivedTherapyCounselingTreatment', sql.Bit, data.ReceivedTherapyCounselingTreatment === '1' || data.ReceivedTherapyCounselingTreatment === 'Yes' ? 1 : 0)
            .input('CurrentMedicalPsychologicalCondition', sql.NVarChar, data.CurrentMedicalPsychologicalCondition || null)
            .input('Medications', sql.NVarChar, data.Medications || null);

        if (medRes.recordset.length > 0) {
            await request.query(`
                UPDATE MedicalBackground SET 
                    Height = @Height, Weight = @Weight, PWD = @PWD, PWDIDNo = @PWDIDNo, DisabilityType = @DisabilityType, 
                    ReceivedTherapyCounselingTreatment = @ReceivedTherapyCounselingTreatment, 
                    CurrentMedicalPsychologicalCondition = @CurrentMedicalPsychologicalCondition, Medications = @Medications
                WHERE StudentID = @StudentID
            `);
        } else {
            await request.query(`
                INSERT INTO MedicalBackground (StudentID, Height, Weight, PWD, PWDIDNo, DisabilityType, ReceivedTherapyCounselingTreatment, CurrentMedicalPsychologicalCondition, Medications)
                VALUES (@StudentID, @Height, @Weight, @PWD, @PWDIDNo, @DisabilityType, @ReceivedTherapyCounselingTreatment, @CurrentMedicalPsychologicalCondition, @Medications)
            `);
        }
        res.json({ success: true, studentId: data.StudentID, message: 'Medical info saved!' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 2.6 Save or Update Other Info
app.post('/api/student/other', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        const data = req.body;
        if (!data.StudentID) return res.status(400).json({ success: false, error: 'StudentID is required' });

        const otherRes = await pool.request().input('StudentID', sql.Int, data.StudentID).query('SELECT OtherInfoID FROM OtherInformation WHERE StudentID = @StudentID');

        let request = pool.request()
            .input('StudentID', sql.Int, data.StudentID)
            .input('SpecialInterests', sql.NVarChar, data.SpecialInterests || null)
            .input('SkillsTalents', sql.NVarChar, data.SkillsTalents || null)
            .input('HobbiesRecreationalActivities', sql.NVarChar, data.Hobbies || null)
            .input('AmbitionGoals', sql.NVarChar, data.AmbitionGoals || null)
            .input('GuidingPrinciples', sql.NVarChar, data.GuidingPrinciples || null)
            .input('DistinctPersonalityTrait', sql.NVarChar, data.DistinctPersonalityTrait || null)
            .input('EntranceExamResult', sql.Bit, data.EntranceExamResult === '1' || data.EntranceExamResult === 'Yes' || data.EntranceExamResult === 'true' ? 1 : 0)
            .input('LatestGPA', sql.Float, data.LatestGPA ? parseFloat(data.LatestGPA) : null);

        if (otherRes.recordset.length > 0) {
            await request.query(`
                UPDATE OtherInformation SET 
                    SpecialInterests = @SpecialInterests, SkillsTalents = @SkillsTalents, HobbiesRecreationalActivities = @HobbiesRecreationalActivities, 
                    AmbitionGoals = @AmbitionGoals, GuidingPrinciples = @GuidingPrinciples, DistinctPersonalityTrait = @DistinctPersonalityTrait,
                    EntranceExamResult = @EntranceExamResult, LatestGPA = @LatestGPA
                WHERE StudentID = @StudentID
            `);
        } else {
            await request.query(`
                INSERT INTO OtherInformation (StudentID, SpecialInterests, SkillsTalents, HobbiesRecreationalActivities, AmbitionGoals, GuidingPrinciples, DistinctPersonalityTrait, EntranceExamResult, LatestGPA)
                VALUES (@StudentID, @SpecialInterests, @SkillsTalents, @HobbiesRecreationalActivities, @AmbitionGoals, @GuidingPrinciples, @DistinctPersonalityTrait, @EntranceExamResult, @LatestGPA)
            `);
        }
        res.json({ success: true, studentId: data.StudentID, message: 'Other info saved!' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 2.7 Save or Update Enrollment
app.post('/api/student/enrollment', async (req, res) => {
    try {
        const data = req.body;
        if (!data.StudentID) {
            return res.status(400).json({ success: false, error: 'StudentID is required' });
        }

        const enrollRes = await pool.request().input('StudentID', sql.Int, data.StudentID).query('SELECT EnrollmentID FROM Enrollment WHERE StudentID = @StudentID');
        const isUpdate = enrollRes.recordset.length > 0;

        let query = '';
        if (isUpdate) {
            query = `
                UPDATE Enrollment SET 
                    Program = @Program,
                    Campus = @Campus,
                    SubjectCode = @SubjectCode,
                    SubjectName = @SubjectName,
                    Units = @Units,
                    AcademicYear = @AcademicYear,
                    Semester = @Semester,
                    YearSection = @YearSection,
                    UserID = @UserID,
                    EnrollmentDate = @EnrollmentDate,
                    StudentNo = @StudentNo
                WHERE StudentID = @StudentID
            `;
        } else {
            query = `
                INSERT INTO Enrollment 
                (StudentID, Program, Campus, SubjectCode, SubjectName, Units, AcademicYear, Semester, YearSection, UserID, EnrollmentDate, StudentNo) 
                VALUES 
                (@StudentID, @Program, @Campus, @SubjectCode, @SubjectName, @Units, @AcademicYear, @Semester, @YearSection, @UserID, @EnrollmentDate, @StudentNo)
            `;
        }

        await pool.request()
            .input('StudentID', sql.Int, data.StudentID)
            .input('Program', sql.VarChar, data.Program || null)
            .input('Campus', sql.VarChar, data.Campus || null)
            .input('SubjectCode', sql.VarChar, data.SubjectCode || null)
            .input('SubjectName', sql.VarChar, data.SubjectName || null)
            .input('Units', sql.Int, data.Units ? parseInt(data.Units) : null)
            .input('AcademicYear', sql.VarChar, data.AcademicYear || null)
            .input('Semester', sql.VarChar, data.Semester || null)
            .input('YearSection', sql.VarChar, data.YearSection || null)
            .input('UserID', sql.Int, data.UserID ? parseInt(data.UserID) : null)
            .input('EnrollmentDate', sql.DateTime, data.EnrollmentDate ? new Date(data.EnrollmentDate) : new Date())
            .input('StudentNo', sql.VarChar, data.StudentNo || null)
            .query(query);

        res.json({ success: true, message: 'Enrollment info saved!' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 2.8 Fetch All Students (for the Users table)
app.get('/api/students', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT StudentID, FirstName, LastName, Email FROM GeneralInformation ORDER BY StudentID DESC');
        res.json({ success: true, students: result.recordset });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 3. Delete Student Record
app.delete('/api/student/:id', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        // 1. Manually delete from all associated tables by StudentID
        let reqDel = pool.request().input('StudentID', sql.Int, req.params.id);
        await reqDel.query('DELETE FROM FamilyBackground WHERE StudentID = @StudentID');
        await reqDel.query('DELETE FROM EducationalBackground WHERE StudentID = @StudentID');
        await reqDel.query('DELETE FROM Sibling WHERE StudentID = @StudentID');
        await reqDel.query('DELETE FROM MedicalBackground WHERE StudentID = @StudentID');
        await reqDel.query('DELETE FROM OtherInformation WHERE StudentID = @StudentID');
        await reqDel.query('DELETE FROM Enrollment WHERE StudentID = @StudentID');

        // 3. Finally, delete the main General Information record
        await pool.request().input('ID', sql.Int, req.params.id).query('DELETE FROM GeneralInformation WHERE StudentID = @ID');
        
        res.json({ success: true, message: 'Student record deleted successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(5000, () => console.log('Server listening on http://localhost:5000'));
