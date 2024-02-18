var express = require('express');
var app = express();
const session = require("express-session");
var bodyParser = require('body-parser');
var db = require('./db');
const mysql = require('mysql');

const cors = require('cors');
app.use(session({
    secret: "123qwe",
    resave: false,
    saveUninitialized: false
}));

app.use(cors());
app.use(express.json())

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
    res.render('home')
});


app.post('/contact_user', async (req, res) => {
    let { first_name, last_name, email, phone, doubt } = req.body;

    let values = [first_name, last_name, email, phone, doubt];
    let sql = `insert into  contactus (first_name, last_name,email,phone,doubt) values(?,?,?,?,?)`;
    db.query(sql, values, (err, result) => {
        if (err) throw err;

        else {
            res.redirect('listcontactus');
        }
    })
})



app.post('/signup_user', async (req, res) => {
    let { email, password, first_name, last_name, phone } = req.body;

    let dor = new Date();
    let values = [email, password, dor, first_name, last_name, phone];

    let sql = `insert into  users (email,password,dor,first_name,last_name,phone) values(?,?,?,?,?,?)`;
    db.query(sql, values, (err, result) => {
        if (err) throw err;

        else {
            res.redirect('listusers');
        }
    })
})


app.post('/feedback_user', (req, res) => {
    let { client_name, creativity, designing, team_work, feedback, service_id } = req.body;
    let sql = "INSERT INTO feedback ( client_name,creativity,designing,team_work,feedback,service_id) VALUES ('" + client_name + "','" + creativity + "','" + designing + "','" + team_work + "','" + feedback + "','" + service_id + "')";

    let values = [client_name, creativity, designing, team_work, feedback, service_id];
    db.query(sql, values, (err, result) => {
        if (err) throw err;

        else {
            res.redirect('listfeedbacks');
        }
    })
})





app.post("/login", (req, res) => {
    const { email, password } = req.body;

    db.query(
        "SELECT * FROM users WHERE email = ? and password=?", [email, password], (err, result) => {
            if (err) {
                console.error("Error querying database:", err);
                return res.send("error");
            }

            console.log(result.length)
            if (result.length > 0) {
                res.send({ message: "success" });
            }

            else {
                res.send({ message: "password dont match" });
            }
        }
    );
});
















app.get('/listcontactus', function (req, res) {
    db.query('SELECT * from contactus', function (err, result) {
        if (err) {
            console.error('Error querying the database:', err);
            return;
        }

        res.render('listcontactus', { result: result });
    });
});

app.get('/deletecontact', function (req, res) {
    let id = req.query.id;
    db.query("DELETE FROM contactus WHERE id=" + id, function (err, result) {
        res.redirect('/listcontactus');

    });
});



app.get('/listemp', function (req, res) {
    db.query('SELECT * FROM emp JOIN departments ON emp.deptid = departments.deptid', function (err, result) {

        if (err) {
            console.error('Error querying the database:', err);
            return;
        }



        if (req.headers.accept && req.headers.accept.includes("application/json")) {
            res.send(result);
        }


        else {
            res.render('listemp', { result: result });
        }
    });
});


app.get('/addemp', function (req, res) {
    db.query("select * from departments", function (err, result) {
        res.render('addemp', { result: result });
    })
});


app.post('/addemp_submit', function (req, res) {
    let { ename, add1, dob, salary, deptid, emp_logo } = req.body;
    let cdate = new Date();
    let month = cdate.getMonth() + 1;
    let doj = cdate.getFullYear() + "-" + month + "-" + cdate.getDate();
    let sql = "INSERT INTO emp (ename, add1, dob, doj, salary, deptid,emp_logo) VALUES ('" + ename + "','" + add1 + "','" + dob + "','" + doj + "','" + salary + "','" + deptid + "','" + emp_logo + "')";

    db.query(sql, function (err, result) {
        if (result.insertId > 0) {
            res.redirect('/listemp');
        }
    });
});


app.get('/editemp', function (req, res) {
    let empid = req.query.empid;
    db.query("SELECT * FROM emp WHERE empid=" + empid, function (err, empdata) {
        db.query("SELECT * FROM departments", function (err, deptdata) {
            res.render('editemp', { empdata: empdata[0], deptdata: deptdata });
        });
    });
});

app.post('/editemp_submit', function (req, res) {
    let { empid, ename, add1, salary, deptid, emp_logo } = req.body;
    let values = [ename, add1, salary, deptid, emp_logo, empid];

    let sql = `UPDATE emp SET ename=?, add1=?, salary=?, deptid=? , emp_logo=? WHERE empid=?`;

    db.query(sql, values, function (err, result) {
        res.redirect('/listemp');
    });
});




app.get('/deleteemp', function (req, res) {
    let empid = req.query.empid;
    db.query("DELETE FROM emp WHERE empid=" + empid, function (err, result) {
        res.redirect('/listemp');

    });
});





















app.get('/listdept', function (req, res) {
    db.query('SELECT * FROM departments', function (err, result) {
        if (err) {
            console.error('Error querying the database:', err);
            return;
        }


        res.render('listdept', { result: result });
    });
});



app.get('/adddep', function (req, res) {
    db.query("select * from departments", function (err, result) {
        res.render('adddep', { result: result });
    })
});


app.post('/adddep_submit', function (req, res) {
    let { dname } = req.body;

    let sql = "INSERT INTO departments (dname) VALUES ('" + dname + "')";

    db.query(sql, function (err, result) {
        if (result.insertId > 0) {
            res.redirect('/listdept');
        }
    });
});

app.get('/editdept', function (req, res) {
    let deptid = req.query.deptid;
    db.query("SELECT * FROM departments WHERE deptid=" + deptid, function (err, deptdata) {
        res.render('editdept', { deptdata: deptdata[0] });
    });
});

app.post('/editdept_submit', function (req, res) {
    let { deptid, dname } = req.body;
    let sql = `UPDATE departments SET dname='${dname}' WHERE deptid=${deptid}`;

    db.query(sql, function (err, result) {
        res.redirect('/listdept');

    });
});

app.get('/deletedept', function (req, res) {
    let deptid = req.query.deptid;
    db.query("DELETE FROM departments WHERE deptid=" + deptid, function (err, result) {
        res.redirect('/listdept');
    });
});























app.get('/addprojects', function (req, res) {
    db.query("select * from projects", function (err, result) {
        res.render('addprojects', { result: result });
    })
});


app.post('/addprojects_submit', function (req, res) {
    let { project_name, project_description, languages_used, project_logo, project_description_l } = req.body;

    let sql = "INSERT INTO projects (project_name,project_description,languages_used,project_logo,project_description_l) VALUES ('" + project_name + "','" + project_description + "','" + languages_used + "','" + project_logo + "','" + project_description_l + "')";

    db.query(sql, function (err, result) {
        res.redirect('/listprojects');
    });
});


app.get('/listprojects', function (req, res) {
    db.query('SELECT * FROM projects', function (err, result) {
        if (err) {
            console.error('Error querying the database:', err);
            return;
        }

        if (req.headers.accept && req.headers.accept.includes("application/json")) {
            res.send(result);
        }
        else {
            res.render('listprojects', { result: result });
        }
    });
});

app.get('/editproject', function (req, res) {
    let project_id = req.query.project_id;
    db.query("SELECT * FROM projects WHERE project_id=" + project_id, function (err, projectData) {
        res.render('editproject', { projectData: projectData[0] });
    });
});

app.post('/editproject_submit', function (req, res) {
    let { project_id, project_name, project_description, languages_used, project_logo, project_description_l } = req.body;
    console.log(req.body)
    let sql = `UPDATE projects SET project_name='${project_name}' ,project_description='${project_description}',languages_used='${languages_used}' ,project_logo='${project_logo}' ,project_description_l='${project_description_l}'WHERE project_id=${project_id}`;

    db.query(sql, function (err, result) {
        res.redirect('/listprojects');
    });
});

app.get('/deleteproject', function (req, res) {
    let project_id = req.query.project_id;
    db.query("DELETE FROM projects WHERE project_id=" + project_id, function (err, result) {
        res.redirect('/listprojects');
    });
});
























app.get('/listservices', function (req, res) {
    db.query('SELECT * FROM services', function (err, result) {
        if (err) {

            console.error('Error querying the database:', err);
            return;
        }

        if (req.headers.accept && req.headers.accept.includes("application/json")) {
            res.send(result);
        }

        else {
            res.render('listservices', { result: result });
        }

    });
});



app.get('/addservices', function (req, res) {
    db.query("select * from services", function (err, result) {
        res.render('addservices', { result: result });
    })
});


app.post('/addservice_submit', function (req, res) {
    let { service_name, service_logo } = req.body;

    let sql = "INSERT INTO services (service_name,service_logo) VALUES ('" + service_name + "','" + service_logo + "')";

    db.query(sql, function (err, result) {
        if (result.insertId > 0) {
            res.redirect('/listservices');
        }
    });
});

app.get('/editservice', function (req, res) {
    let service_id = req.query.service_id;
    db.query("SELECT * FROM services WHERE service_id=" + service_id, function (err, servicedata) {
        res.render('editservice', { servicedata: servicedata[0] });
    });
});

app.post('/editservice_submit', function (req, res) {
    let { service_id, service_name, service_logo } = req.body;
    let sql = `UPDATE services SET service_name='${service_name}' ,service_logo='${service_logo}' WHERE service_id=${service_id}`;

    db.query(sql, function (err, result) {
        res.redirect('/listservices');

    });
});

app.get('/deleteservice', function (req, res) {
    let service_id = req.query.service_id;
    db.query("DELETE FROM services WHERE service_id=" + service_id, function (err, result) {
        res.redirect('/listservices');
    });
});













app.get('/addfacts', function (req, res) {
    db.query("select * from facts", function (err, result) {
        res.render('addfacts', { result: result });
    })
});


app.post('/addfacts_submit', function (req, res) {
    let { fact_name, fact_brief, fact_logo, fact_description } = req.body;

    let sql = "INSERT INTO facts (fact_name,fact_brief,fact_logo ,fact_description) VALUES ('" + fact_name + "','" + fact_brief + "','" + fact_logo + "','" + fact_description + "')";

    db.query(sql, function (err, result) {
        res.redirect('/listfacts');
    });
});


app.get('/listfacts', function (req, res) {
    db.query('SELECT * FROM facts', function (err, result) {
        if (err) {
            console.error('Error querying the database:', err);
            return;
        }

        if (req.headers.accept && req.headers.accept.includes("application/json")) {
            res.send(result);
        }
        else {
            res.render('listfacts', { result: result });
        }
    });
});

app.get('/editfacts', function (req, res) {
    let fact_id = req.query.fact_id;
    db.query("SELECT * FROM facts WHERE fact_id=" + fact_id, function (err, factData) {
        res.render('editfacts', { factData: factData[0] });
    });
});

app.post('/editfacts_submit', function (req, res) {
    let { fact_name, fact_brief, fact_logo, fact_description, fact_id } = req.body;
    console.log(req.body)
    let sql = `UPDATE facts SET fact_name='${fact_name}' ,fact_brief='${fact_brief}',fact_logo='${fact_logo}' ,fact_description='${fact_description}' WHERE fact_id='${fact_id}'`;

    db.query(sql, function (err, result) {
        res.redirect('/listfacts');
    });
});

app.get('/deletefacts', function (req, res) {
    let fact_id = req.query.fact_id;
    db.query("DELETE FROM facts WHERE fact_id=" + fact_id, function (err, result) {
        res.redirect('/listfacts');
    });
});

























app.get('/listfeedbacks', function (req, res) {
    db.query('SELECT * FROM feedback JOIN services ON feedback.service_id = services.service_id;', function (err, result) {
        if (err) {
            throw err;
        }
        if (req.headers.accept && req.headers.accept.includes("application/json")) {
            res.send(result);
        } else {
            // Render a view or send an HTML response
            res.render('listfeedbacks', { result: result });
        }
    });
});


app.get('/addfeedbacks', function (req, res) {
    db.query("select * from services", function (err, result) {
        res.render('addfeedbacks', { result: result });
    })
});


app.post('/addfeedback_submit', function (req, res) {
    let { client_name, creativity, designing, team_work, feedback, service_id } = req.body;
    let sql = "INSERT INTO feedback ( client_name,creativity,designing,team_work,feedback,service_id) VALUES ('" + client_name + "','" + creativity + "','" + designing + "','" + team_work + "','" + feedback + "','" + service_id + "')";

    db.query(sql, function (err, result) {
        if (result.insertId > 0) {
            res.redirect('/listfeedbacks');
        }
    });
});

app.get('/editfeedback', function (req, res) {
    let client_id = req.query.client_id;
    db.query("SELECT * FROM feedback WHERE client_id=" + client_id, function (err, feedbackdata) {
        db.query("SELECT * FROM services", function (err, serviceS) {
            res.render('editfeedback', { feedbackdata: feedbackdata[0], serviceS: serviceS });
        });
    });
});

app.post('/editfeedback_submit', function (req, res) {
    let { client_id, client_name, creativity, designing, team_work, feedback, service_id } = req.body;
    let values = [client_name, creativity, designing, team_work, feedback, service_id, client_id];

    let sql = `UPDATE feedback SET client_name=?, creativity=?, designing=?, team_work=?, feedback=?, service_id=? WHERE client_id=?`;

    db.query(sql, values, function (err, result) {
        console.log(err);
        res.redirect('/listfeedbacks');
    });

});




app.get('/deletefeedback', function (req, res) {
    let client_id = req.query.client_id;
    db.query("DELETE FROM feedback WHERE client_id=" + client_id, function (err, result) {
        res.redirect('/listfeedbacks');
    });
});











app.get('/listusers', function (req, res) {
    db.query('SELECT * from users', function (err, result) {
        if (err) {
            console.error('Error querying the database:', err);
            return;
        }

        res.render('listusers', { result: result });
    });
});



app.get('/addusers', function (req, res) {
    db.query("select * from users", function (err, result) {
        res.render('addusers', { result: result });
    })
});


app.post('/addusers_submit', function (req, res) {
    let { email, password, first_name, last_name, phone } = req.body;
    let dor = new Date().toISOString().slice(0, 19).replace('T', ' ');
    let sql = "INSERT INTO users (email, password, dor, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?, ?)";
    let values = [email, password, dor, first_name, last_name, phone];

    db.query(sql, values, function (err, result) {
        if (err) throw err;
        res.redirect('/listusers');
    });
});

app.get('/editusers', function (req, res) {
    let user_id = req.query.user_id;
    db.query("SELECT * FROM users WHERE user_id=" + user_id, function (err, userData) {
        res.render('editusers', { userData: userData[0] });
    });
});

app.post('/editusers_submit', function (req, res) {
    let { user_id, email, password, first_name, last_name, phone } = req.body;
    let values = [email, password, first_name, last_name, phone, user_id];

    let sql = `UPDATE users SET email=?, password=?,  first_name=?, last_name=?, phone=? WHERE user_id=?`;

    db.query(sql, values, function (err, result) {
        if (err) throw err;
        res.redirect('/listusers');
    });

});



app.get('/deleteusers', function (req, res) {
    let user_id = req.query.user_id;
    db.query("DELETE FROM users WHERE user_id=" + user_id, function (err, result) {
        res.redirect('/listusers');
    });
});


app.listen(8000, function () { console.log("at 8000") });