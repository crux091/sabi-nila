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

        let result = await pool.request()
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
            .input('PermanentAddress', sql.NVarChar, data.PermanentAddress)
            .query(`
                INSERT INTO GeneralInformation 
                (LastName, FirstName, MiddleName, SuffixID, SexID, Age, CivilStatusID, Religion, RegionID, LanguageSpoken, IndigenousGroup, ContactNo, Email, FBLink, CurrentResidence, PresentAddress, PermanentAddress)
                OUTPUT INSERTED.StudentID
                VALUES 
                (@LastName, @FirstName, @MiddleName, @SuffixID, @SexID, @Age, @CivilStatusID, @Religion, @RegionID, @LanguageSpoken, @IndigenousGroup, @ContactNo, @Email, @FBLink, @CurrentResidence, @PresentAddress, @PermanentAddress)
            `);

        res.json({ success: true, studentId: result.recordset[0].StudentID, message: 'General information saved!' });
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
        const famRes = await pool.request().input('ID', sql.Int, studentId).query('SELECT * FROM FamilyBackground WHERE StudentID = @ID');
        const eduRes = await pool.request().input('ID', sql.Int, studentId).query('SELECT * FROM EducationalBackground WHERE StudentID = @ID');

        if (genRes.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'Student ID not found' });
        }

        res.json({
            success: true,
            general: genRes.recordset[0],
            family: famRes.recordset[0] || {},
            education: eduRes.recordset[0] || {}
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 3. Delete Student Record
app.delete('/api/student/:id', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        await pool.request().input('ID', sql.Int, req.params.id).query('DELETE FROM GeneralInformation WHERE StudentID = @ID');
        res.json({ success: true, message: 'Student record deleted successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(5000, () => console.log('Server listening on http://localhost:5000'));
