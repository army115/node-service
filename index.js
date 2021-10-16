'use strict';

require('dotenv').config();
const Knex = require('knex');
const crypto = require('crypto');
var multer = require('multer');
var path = require('path');

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const HttpStatus = require('http-status-codes');
const fse = require('fs-extra');
const jwt = require('./jwt');
const model = require('./model');

const app = express();

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

const uploadDir = process.env.UPLOAD_DIR || './uploaded';

fse.ensureDirSync(uploadDir);

// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, uploadDir)
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + '-' + file.originalname)
//   }
// })

// var upload = multer({ storage: storage });

// var upload = multer({ dest: process.env.UPLOAD_DIR || './uploaded' });

var db = require('knex')({
  client: 'mysql',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: +process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    insecureAuth : true
  }
});

let checkAuth = (req, res, next) => {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  } else {
    token = req.body.token;
  }

  jwt.verify(token)
    .then((decoded) => {
      req.decoded = decoded;
      next();
    }, err => {
      return res.send({
        ok: false,
        error: HttpStatus.getStatusText(HttpStatus.UNAUTHORIZED),
        code: HttpStatus.UNAUTHORIZED
      });
    });
}

app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.get('/', (req, res) => res.send({ ok: true, message: 'Welcome to my api serve!', code: HttpStatus.OK }));
// app.post('/upload', upload.single('file'), (req, res) => {
//   console.log(req.body);
//   console.log(req.file);
//   res.send({ ok: true, message: 'File uploaded!', code: HttpStatus.OK });
// });

//login (เข้าสู่ระบบ)********************************************************************************************************************

//login user (เข้าสู่ระบบลูกค้า)
app.post('/login', async (req, res) => {
  var username = req.body.username;
  var password = req.body.password;

  console.log(username);
  console.log(password);

  if (username && password) {

    try {
      var rs = await model.doLogin(db, username, password);
      if (rs.length) {
        var token = jwt.sign({ username: username });
        res.send({ ok: true, token: token, id: rs[0].u_id });
      } else {
        res.send({ ok: false, error: 'Invalid username or password!', code: HttpStatus.UNAUTHORIZED });
      }
    } catch (error) {
      console.log(error);
      res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
    }

  } else {
    res.send({ ok: false, error: 'Invalid data!', code: HttpStatus.INTERNAL_SERVER_ERROR });
  }

});

//login person (เข้าสู่ระบบพนักงานส่ง)
app.post('/login2', async (req, res) => {
  var username = req.body.username;
  var password = req.body.password;

  console.log(username);
  console.log(password);

  if (username && password) {

    try {
      var rs = await model.doLogin2(db, username, password);
      if (rs.length) {
        var token = jwt.sign({ username: username });
        res.send({ ok: true, token: token, psid: rs[0].ps_id });
      } else {
        res.send({ ok: false, error: 'Invalid username or password!', code: HttpStatus.UNAUTHORIZED });
      }
    } catch (error) {
      console.log(error);
      res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
    }

  } else {
    res.send({ ok: false, error: 'Invalid data!', code: HttpStatus.INTERNAL_SERVER_ERROR });
  }

});

//login admin (เข้าสู่ระบบพนักงานส่ง)
app.post('/loginadmin', async (req, res) => {
  var username = req.body.username;
  var password = req.body.password;

  console.log(username);
  console.log(password);

  if (username && password) {

    try {
      var rs = await model.adminLogin(db, username, password);
      if (rs.length) {
        var token = jwt.sign({ username: username });
        res.send({ ok: true, token: token, adid: rs[0].ad_id });
      } else {
        res.send({ ok: false, error: 'Invalid username or password!', code: HttpStatus.UNAUTHORIZED });
      }
    } catch (error) {
      console.log(error);
      res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
    }

  } else {
    res.send({ ok: false, error: 'Invalid data!', code: HttpStatus.INTERNAL_SERVER_ERROR });
  }

});

//register member (สมัครสมาชิก)*********************************************************************************************************************

//add user (เพิ่มลูกค้า)
app.post('/register', async (req, res, next) => {
  try {
    
    var u_user = req.body.u_user;
    var u_pass = req.body.u_pass;
    var u_name = req.body.u_name;
    var u_lastname = req.body.u_lastname;
    var u_tel = req.body.u_tel;
    var u_email = req.body.u_email;
    // var as_id = req.body.as_id;
    
    console.log(u_user);
    console.log(u_pass);
    console.log(u_name);
    console.log(u_lastname);
    console.log(u_tel);
    console.log(u_email);
    // console.log(as_id);


    if (u_user && u_pass && u_name && u_lastname && u_tel && u_email ) {
      var data = {
        u_user: u_user,
        u_pass: u_pass,
        u_name: u_name,
        u_lastname: u_lastname,
        u_tel: u_tel,
        u_email: u_email,
        // as_id: as_id,
      };


      var rs = await model.register(db, data);
      res.send({ ok: true, id: rs[0] });
    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//add order (เพิ่มออเดอร์)
app.post('/addorder/:u_id',checkAuth, async (req, res, next) => {
  try {
    var u_id = req.params.u_id;
    var or_num = req.body.or_num;
    var or_detail = req.body.or_detail;
    var or_office = req.body.or_office;
    var or_lat = req.body.or_lat;
    var or_lng = req.body.or_lng;
    var or_address = req.body.or_address;
    
    console.log(u_id)
    console.log(or_num);
    console.log(or_detail);
    console.log(or_office);
    console.log(or_lat);
    console.log(or_lng);
    console.log(or_address);

    // && or_date
    if (u_id  && or_num && or_detail && or_address && or_office) {
      var data = {
        u_id,
        or_num: or_num,
        or_detail: or_detail,
        or_office: or_office,
        or_lat: or_lat,
        or_lng: or_lng,
        or_address: or_address,
      };


      var rs = await model.addorder(db, data);
      res.send({ ok: true, id: rs[0] });
    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//check order (เช็คออเดอร์)
app.post('/checkOrder/:ps_id',checkAuth, async (req, res, next) => {
  try {
    
    var ps_id = req.params.ps_id;
    var or_id = req.body.or_id;
    var check_num = req.body.check_num;

    console.log(ps_id)
    console.log(or_id)
    console.log(check_num);

    if ( ps_id  && or_id  && check_num ) {
      var data = {
        or_id : or_id,
        ps_id : ps_id,
        check_num: check_num,
      };
      var rs = await model.checkorder(db, data);
      res.send({ ok: true, id: rs[0] });
    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//sent order (เพิ่มข้อมูลส่ง)
app.post('/sentOrder/:ps_id',checkAuth, async (req, res, next) => {
  try {
    
    var ps_id = req.params.ps_id;
    var or_id = req.body.or_id;
    var check_id = req.body.check_id;
    var sent_num = req.body.sent_num;

    console.log(ps_id)
    console.log(or_id)
    console.log(check_id)
    console.log(sent_num);

    if ( ps_id  && or_id && check_id && sent_num ) {
      var data = {
        or_id : or_id,
        check_id : check_id,
        ps_id : ps_id,
        sent_num: sent_num,
      };
      var rs = await model.sentorder(db, data);
      res.send({ ok: true, id: rs[0] });
    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//save track (บันทึกข้อมูล)
app.post('/Savetrack', async (req, res, next) => {
  try {
    
    var track_name = req.body.track_name;
    var track_num = req.body.track_num;
    var track_sale = req.body.track_sale;
    var or_id = req.body.or_id;


    console.log(track_name);
    console.log(track_num);
    console.log(track_sale);
    console.log(or_id);


    if (track_name  && track_num && track_sale && or_id ) {
      var data = {
        track_name : track_name,
        track_num: track_num,
        track_sale: track_sale,
        or_id: or_id,

      };
      var rs = await model.savetrack(db, data);
      res.send({ ok: true, id: rs[0] });
    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//payment (ชำระเงิน)
app.post('/Payment', async (req, res, next) => {
  try {
    // var u_id = req.params.u_id;
    var or_id = req.body.or_id;
    var pay_sale = req.body.pay_sale;
    var pay_bank = req.body.pay_bank;
    // var pay_num = req.body.pay_num;

    // console.log(u_id)
    console.log(or_id)
    console.log(pay_sale);
    console.log(pay_bank);
    // console.log(pay_num);

    if (or_id && pay_sale && pay_bank) {
      var data = {
        // u_id,
        or_id : or_id,
        pay_sale: pay_sale,
        pay_bank: pay_bank,
        // pay_num: pay_num,
      };
      var rs = await model.Payment(db, data);
      res.send({ ok: true, id: rs[0] });
    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//add person (เพิ่มพนักงานส่ง)
app.post('/addperson', async (req, res, next) => {
  try {
    var ps_user = req.body.ps_user;
    var ps_pass = req.body.ps_pass;
    var ps_name = req.body.ps_name;
    var ps_lastname = req.body.ps_lastname;
    var ps_address = req.body.ps_address;
    var ps_email = req.body.ps_email;
    var ps_tel = req.body.ps_tel;
    
    console.log(ps_user);
    console.log(ps_pass);
    console.log(ps_name);
    console.log(ps_lastname);
    console.log(ps_address);
    console.log(ps_email);
    console.log(ps_tel);

    if (ps_user && ps_pass && ps_name && ps_lastname && ps_address && ps_email && ps_tel ) {
      var data = {
        ps_user: ps_user,
        ps_pass: ps_pass,
        ps_name: ps_name,
        ps_lastname: ps_lastname,
        ps_address: ps_address,
        ps_email: ps_email,
        ps_tel: ps_tel,
      };


      var rs = await model.addperson(db, data);
      res.send({ ok: true, id: rs[0] });
    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//update informetion (อัพเดตข้อมูล)***************************************************************************************************

//update password (เปลี่ยนรหัสผ่าน)
app.put('/updatepass/:u_id', checkAuth, async (req, res, next) => {
  try {
    var u_id = req.params.u_id;
    var u_pass = req.body.u_pass;

    
    console.log(u_pass);

    if (u_id && u_pass) {
      var data = {
        u_pass: u_pass,
      };
      var rs = await model.updatepass(db, u_id, data);
      console.log(rs);

      res.send({ ok: true });
    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//update informetion user (อัพเดตข้อมูล ลูกค้า)
app.put('/update/:u_id', checkAuth, async (req, res, next) => {
  try {
    var u_id = req.params.u_id;
    // var u_user = req.body.u_user;
    var u_name = req.body.u_name;
    var u_lastname = req.body.u_lastname;
    var u_tel = req.body.u_tel;
    var u_email = req.body.u_email;
    
    // console.log(u_user);
    console.log(u_name);
    console.log(u_lastname);
    console.log(u_tel);
    console.log(u_email);

    if (u_id && u_name && u_lastname && u_tel && u_email) {
      var data = {
        // u_user: u_user,
        u_name: u_name,
        u_lastname: u_lastname,
        u_tel: u_tel,
        u_email: u_email,
      };
      var rs = await model.update(db, u_id, data);
      console.log(rs);

      res.send({ ok: true });
    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//update informetion person (อัพเดตข้อมูล พนักงานส่ง)
app.put('/updateperson/:ps_id', checkAuth, async (req, res, next) => {
  try {
    var ps_id = req.params.ps_id;
    // var u_user = req.body.u_user;
    var ps_name = req.body.ps_name;
    var ps_lastname = req.body.ps_lastname;
    var ps_tel = req.body.ps_tel;
    var ps_email = req.body.ps_email;
    var ps_address = req.body.ps_address;

    // console.log(u_user);
    console.log(ps_name);
    console.log(ps_lastname);
    console.log(ps_tel);
    console.log(ps_email);
    console.log(ps_address);

    if (ps_id && ps_name && ps_lastname && ps_tel && ps_email) {
      var data = {
        // u_user: u_user,
        ps_name: ps_name,
        ps_lastname: ps_lastname,
        ps_tel: ps_tel,
        ps_email: ps_email,
        ps_address: ps_address,
      };
      var rs = await model.updateperson(db, ps_id, data);
      console.log(rs);

      res.send({ ok: true });
    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//update status (อัพเดต สถานะ)
app.put('/updatestatus/:or_id', checkAuth, async (req, res, next) => {
  try {
    var or_id = req.params.or_id;
    var or_status = req.body.or_status;
    
    console.log(or_status);

    if (or_id && or_status ) {
      var data = {
        or_status: or_status,
      };
      var rs = await model.updatestatus(db, or_id, data);
      console.log(rs);

      res.send({ ok: true });
    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//sale total (ราคารวม)
app.put('/savetotal/:sent_id', checkAuth, async (req, res, next) => {
  try {
    var sent_id = req.params.sent_id;
    var sent_sale = req.body.sent_sale;
    
    console.log(sent_sale);

    if (sent_id && sent_sale ) {
      var data = {
        sent_sale: sent_sale,
      };
      var rs = await model.savetotal(db, sent_id, data);
      console.log(rs);

      res.send({ ok: true });
    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//update date (อัพเดตวันที่ส่ง)
app.put('/updatetime/:check_id', checkAuth, async (req, res, next) => {
  try {
    var check_id = req.params.check_id;
    var send_date = new Date();
    
    console.log(send_date);

    if (check_id && send_date ) {
      var data = {
        send_date: send_date,
      };
      var rs = await model.updatetime(db, check_id, data);
      console.log(rs);

      res.send({ ok: true });
    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//delate (ลบข้อมูล)*****************************************************************************************************************************

//delete person (ลบพนักงานส่ง)
app.delete('/deleteperson/:ps_id', checkAuth, async (req, res, next) => {
  try {
    var ps_id = req.params.ps_id;
    console.log(ps_id);

    if (ps_id) {
      await model.removeperson(db, ps_id);
      res.send({ ok: true });
    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//cancel order (ยกเลิกออเดอร์)
app.delete('/cancelorder/:or_id', checkAuth, async (req, res, next) => {
  try {
    var id = req.params.or_id;
    console.log(id);

    if (id) {
      await model.removeorder(db, id);
      res.send({ ok: true });
    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//delete image (ลบรูปภาพออเดอร์)
app.delete('/delateimg/:or_id', checkAuth, async (req, res, next) => {
  try {
    var id = req.params.or_id;
    console.log(id);

    if (id) {
      await model.removeimg(db, id);
      res.send({ ok: true });
    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//paypent non (ชำระเงินไม่ถูกต้อง)
app.delete('/paynon/:pay_id', checkAuth, async (req, res, next) => {
  try {
    var id = req.params.pay_id;
    console.log(id);

    if (id) {
      await model.paynon(db, id);
      res.send({ ok: true });
    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

// show infrmetion (แสดงข้อมูล)*********************************************************************************************************************

//show infrmetion user (แสดงข้อมูล ลูกค้า)
app.get('/getprofile/:u_id', checkAuth, async (req, res, next) => {
  try {
    var id = req.params.u_id;
    console.log(id);

    if (id) {
      var rs = await model.getInfo(db, id);
      res.send({ ok: true, userinfo: rs[0] });
    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//show informetion person (แสดงข้อูล พนักงานส่ง)
app.get('/getprofilePerson/:ps_id', checkAuth, async (req, res, next) => {
  try {
    var id = req.params.ps_id;
    console.log(id);

    if (id) {
      var rs = await model.getInfoPerson(db, id);
      res.send({ ok: true, personinfo: rs[0] });
    } else {
      res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//show list (แสดงรายการ)**********************************************************************************************************************

//show list user (แสดงรายการ ลุกค้า)
app.get('/UserList',checkAuth, async (req, res, next) => {
  try {
    var rs = await model.getList(db , 'SELECT * FROM order');
    res.send({ ok: true, User: rs });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

// show list person (แสดงรายการ พนักงานส่ง)
app.get('/personList',checkAuth, async (req, res, next) => {
  try {
    var rs = await model.getListperson(db, 'SELECT * FROM person');
    res.send({ ok: true, person: rs });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

// show list order(แสดงรายการออเดอร์ทั้งหมด )
app.get('/ShowOrderList', async (req, res, next) => {
  try {
    var rs = await model.getListOrder(db, 'SELECT * FROM order desc');
    res.send({ ok: true, order: rs });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

// show Check Order(แสดงรายการออเดอร์ ที่รับแล้ว )
app.get('/CheckOrder', async (req, res, next) => {
  try {
    var rs = await model.getCheckOrder(db, 'SELECT * FROM order desc');
    res.send({ ok: true, check: rs });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

// show Order Sent(แสดงรายการออเดอร์ ที่ส่งแล้ว )
app.get('/ShowOrderSent', async (req, res, next) => {
  try {
    var rs = await model.getOrderSent(db, 'SELECT * FROM order desc');
    res.send({ ok: true, sent: rs });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

// show Order non pay(แสดงรายการออเดอร์ ที่ยังไม่ชำระเงิน)
app.get('/ShowNonpay', async (req, res, next) => {
  try {
    var rs = await model.getNonpay(db, 'SELECT * FROM order desc');
    res.send({ ok: true, non: rs });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});


// show Check Order Person(แสดงรายการออเดอร์ ที่รับแล้ว ของพนักงาน)
app.get('/CheckOderPerson/:ps_id',checkAuth, async (req, res, next) => {
  try {
    var id = req.params.ps_id
    console.log(id);
    
    if(id){
    var rs = await model.getCheckOrderPerson(db, id, 'SELECT * FROM check_order desc');
    res.send({ ok: true, checkperson: rs });
    }else{
    res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

// show Order Sent Person(แสดงรายการออเดอร์ ที่ส่งแล้ว ของพนักงาน)
app.get('/OderSentPerson/:ps_id',checkAuth, async (req, res, next) => {
  try {
    var id = req.params.ps_id
    console.log(id);
    
    if(id){
    var rs = await model.getOrderSentPerson(db, id, 'SELECT * FROM check_order desc');
    res.send({ ok: true, sentperson: rs });
    }else{
    res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

// show list order user (แสดงรายการ ออเดอร์ แต่ละ user)
app.get('/ShowOrderUser/:u_id',checkAuth, async (req, res, next) => {
  try {
    var id = req.params.u_id
    console.log(id);
    
    if(id){
    var rs = await model.getListOrderUser(db, id, 'SELECT * FROM order desc');
    res.send({ ok: true, orderuser: rs });
    }else{
    res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

// show list order user (แสดงรายการ ออเดอร์ ที่รับแล้ว แต่ละ user)
app.get('/CheckOderUser/:u_id',checkAuth, async (req, res, next) => {
  try {
    var id = req.params.u_id
    console.log(id);
    
    if(id){
    var rs = await model.getCheckOrderUser(db, id, 'SELECT * FROM check_order desc');
    res.send({ ok: true, checkuser: rs });
    }else{
    res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

// show order sent user (แสดงรายการ ออเดอร์ ที่ส่งแล้ว แต่ละ user)
app.get('/OderSentUser/:u_id',checkAuth, async (req, res, next) => {
  try {
    var id = req.params.u_id
    console.log(id);
    
    if(id){
    var rs = await model.getOrderSentUser(db, id, 'SELECT * FROM sent_order desc');
    res.send({ ok: true, sentuser: rs });
    }else{
    res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

// show save data user(แสดงข้อมูลที่บันทึกของลูกค้า)
app.get('/ShowNonpayuser/:u_id',checkAuth, async (req, res, next) => {
  try {
    var id = req.params.u_id
    console.log(id);
    
    if(id){
    var rs = await model.getNonpayuser(db, id, 'SELECT * FROM check_order desc');
    res.send({ ok: true, nonuser: rs });
    }else{
    res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

// show payment user(แสดงข้อมูลชำระเงินของลูกค้า)
app.get('/Paymentuser/:u_id',checkAuth, async (req, res, next) => {
  try {
    var id = req.params.u_id
    console.log(id);
    
    if(id){
    var rs = await model.getPaymentuser(db, id, 'SELECT * FROM payment desc');
    res.send({ ok: true, pay: rs });
    }else{
    res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

// show save data(แสดงข้อมูลที่บันทึก )
app.get('/ShowSavetrack/:or_id', async (req, res, next) => {
  try {
    var id = req.params.or_id
    console.log(id);
    
    if(id){
    var rs = await model.getSavetrack(db, id, 'SELECT * FROM savetrack desc');
    res.send({ ok: true, save: rs });
    }else{
    res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

// show payment (แสดงข้อมูลชำระเงิน )
app.get('/Payment', async (req, res, next) => {
  try {
    var rs = await model.getPayment(db, 'SELECT * FROM payment desc');
    res.send({ ok: true, pay: rs });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

// show history (แสดงประวัติการส่ง )
app.get('/Showhistory', async (req, res, next) => {
  try {
    var rs = await model.gethistory(db, 'SELECT * FROM payment desc');
    res.send({ ok: true, his: rs });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

// show history user (แสดงประวัติการส่งลูกค้า )
app.get('/Showhistoryuser/:u_id', async (req, res, next) => {
  try {
    var id = req.params.u_id
    console.log(id);
    
    if(id){
    var rs = await model.gethistoryuser(db, id, 'SELECT * FROM payment desc');
    res.send({ ok: true, hisuser: rs });
    }else{
    res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

// images (รูปภาพ) *******************************************************************************************************************

app.use('/public', express.static('public'));  app.use('/images', express.static('images'));

// Set The Storage Engine
const storage = multer.diskStorage({
  destination: './uploads/images',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

//เช็คนามสกุลไฟล์
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);
  return cb(null, true);

  // if(mimetype && extname){
  //   return cb(null,true);
  // } else {
  //   cb('Error: Images Only!');
  // }
}

//เพิ่มขนาดภาพ
const upload = multer({
  storage:storage,
  limits:{fileSize:100000000000000000},
  fileFilter: function(req,file,cb) {
    checkFileType(file,cb);
  }

}).array('picture',12);



//อัพโหลดรูปภาพ (Sendrepair Upload IMG)
var fileImageName = '';


async function uploadImg(db, data) {
  return await model.sendImages(db, data);
}

// async function getRN_NO(){
//   return await model.getRNNO(db);
// } 

app.post('/uploads', function (req, res, next) {
  upload(req, res, (err) => {
    if (err) {
      console.log('error : ' + err)

    } else {
      if (req.files[0].filename == undefined) {
        console.log('Error: No File Selected')

      } else {
        console.log(`uploads/${req.files[0].filename}`);

        try {

          var or_id = model.getOrid(db)
          //นำ path รูปมาเก็บไว้ใน ตัวแปร
          fileImageName = req.files[0].filename;

          console.log(req.files[0].filename);
          console.log(fileImageName);

          if (or_id && fileImageName) {
            var data = {
              or_id : or_id,
              or_img: fileImageName

            };
            var rs = uploadImg(db, data);
            console.log(rs);

            return res.send({ ok: true, id: rs[0] });
          } else {
            res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
          }
        } catch (error) {
          console.log(error);
          res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
        }
        // insert db 
        // get RN_NO last insert
        // 
      }
    }
  });
});

//todo imagespayment (รูปภาพpayment) *******************************************************************************************************************

app.use('/public', express.static('public'));  app.use('/imagespaymem', express.static('imagespaymem'));

// Set The Storage Engine
const storagePayment = multer.diskStorage({
  destination: './uploads/imagespayment',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});


function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);
  return cb(null, true);

  // if(mimetype && extname){
  //   return cb(null,true);
  // } else {
  //   cb('Error: Images Only!');
  // }
}


const uploadImPm = multer({
  storage:storagePayment,
  limits:{fileSize:20480000},
  fileFilter: function(req,file,cb) {
    checkFileType(file,cb);
  }

}).array('picture',12);



//!อัพโหลดรูปภาพ (Sendrepair Upload IMG)
var fileImageName = '';

async function uploadImgPm(db, data, id) {
  return await model.sendImagesPayment(db, data, id);
}

// async function getRN_NO(){
//   return await model.getRNNO(db);
// } 

app.put('/uploadImPm/:or_id', function (req, res, next) {
  uploadImPm(req, res, (err) => {
    if (err) {
      console.log('error : ' + err)

    } else {
      if (req.files[0].filename == undefined) {
        console.log('Error: No File Selected')

      } else {
        console.log(`uploads/${req.files[0].filename}`);

        try {
          // var pay_id = model.getOrid(db)
          var or_id = req.params.or_id;
          //นำ path รูปมาเก็บไว้ใน ตัวแปร
          fileImageName = req.files[0].filename;

        //  console.log(pay_id);
          console.log(or_id);
          console.log(req.files[0].filename);
          console.log(fileImageName);
          

          if ( or_id &&fileImageName) {
            var data = {
              //pay_id : pay_id,
              or_id : or_id,
              pay_img: fileImageName
              
            };
            var rs = uploadImgPm(db, data ,or_id);
            console.log(rs);

            return res.send({ ok: true, id: rs[0] });
          } else {
            res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
          }
        } catch (error) {
          console.log(error);
          res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
        }
        // insert db 
        // get RN_NO last insert
        // 
      }
    }
  });
});


//todo imagescheckor (รูปภาพcheckor) *******************************************************************************************************************

app.use('/public', express.static('public'));  app.use('/imagescheck', express.static('imagescheck'));

// Set The Storage Engine
const storagecheck = multer.diskStorage({
  destination: './uploads/imagescheck',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});


function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);
  return cb(null, true);

  // if(mimetype && extname){
  //   return cb(null,true);
  // } else {
  //   cb('Error: Images Only!');
  // }
}


const uploadcheck = multer({
  storage:storagecheck,
  limits:{fileSize:20480000},
  fileFilter: function(req,file,cb) {
    checkFileType(file,cb);
  }

}).array('picture',12);



//!อัพโหลดรูปภาพ (Sendrepair Upload IMG)
var fileImageName = '';

async function uploadCheckImg(db, data, id) {
  return await model.sendImagesCheck(db, data, id);
}

// async function getRN_NO(){
//   return await model.getRNNO(db);
// } 

app.put('/uploadscheckor/:or_id', function (req, res, next) {
  uploadcheck(req, res, (err) => {
    if (err) {
      console.log('error : ' + err)

    } else {
      if (req.files[0].filename == undefined) {
        console.log('Error: No File Selected')

      } else {
        console.log(`uploads/${req.files[0].filename}`);

        try {
          var check_id = model.getcheckid(db)
          var or_id = req.params.or_id;
          //นำ path รูปมาเก็บไว้ใน ตัวแปร
          fileImageName = req.files[0].filename;

          console.log(or_id);
          console.log(req.files[0].filename);
          console.log(fileImageName);
          

          if (or_id && check_id &&fileImageName) {
            var data = {
              check_id : check_id,
              check_img: fileImageName
              
            };
            var rs = uploadCheckImg(db, data ,or_id);
            console.log(rs);

            return res.send({ ok: true, id: rs[0] });
          } else {
            res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
          }
        } catch (error) {
          console.log(error);
          res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
        }
        // insert db 
        // get RN_NO last insert
        // 
      }
    }
  });
});

//---------------------------


//show images (แสดงรูปภาพ)
app.get('/getorderimage/:or_id', checkAuth, async (req, res, next) => {
  try {
    var id = req.params.or_id;
    console.log(id);

      var rs = await model.getOrImages(db, id);
      res.send({ ok: true, getorderimage: rs[0] });
    
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//show Checkimages (แสดงรูปภาพ)
app.get('/getCheckimage/:check_id', checkAuth, async (req, res, next) => {
  try {
    var id = req.params.check_id;
    console.log(id);

      var rs = await model.getCheckImages(db, id);
      res.send({ ok: true, getCheckimage: rs[0] });
    
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//show imagesbill (แสดงรูปภาพ).........................................................................................................................................................
app.get('/getorderimagePm/:or_id', checkAuth, async (req, res, next) => {
  try {
    var id = req.params.or_id;
    console.log(id);

      var rs = await model.getOrImagesPm(db, id);
      res.send({ ok: true, getpayimage: rs[0] });
    
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//*****************************************************************************************************************************

//error handlers
if (process.env.NODE_ENV === 'development') {
  app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: {
        ok: false,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        error: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR)
      }
    });
  });
}

app.use((req, res, next) => {
  res.status(HttpStatus.NOT_FOUND).json({
    error: {
      ok: false,
      code: HttpStatus.NOT_FOUND,
      error: HttpStatus.getStatusText(HttpStatus.NOT_FOUND)
    }
  });
});

var port = +process.env.WWW_PORT || 3000;

app.listen(port, () => console.log(`Api listening on port ${port}!`));
