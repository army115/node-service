
module.exports = {
  //logon user (เข้าสู่ระบบลูกค้า)
  doLogin(db, username, password) {
    return db('user')
      .select('u_user', 'u_pass', 'u_id')
      .where('u_user', username)
      .where('u_pass', password)
      .limit(1);
  },

  //login person (เข้าสู่ระบบพนักงานส่ง)
  doLogin2(db, username, password) {
    return db('person')
      .select('ps_user', 'ps_pass', 'ps_id')
      .where('ps_user', username)
      .where('ps_pass', password)
      .limit(1);
  },

  //login admin (เข้าสู่ระบบพนักงานร้าน)
  adminLogin(db, username, password) {
    return db('admin')
      .select('ad_user', 'ad_pass', 'ad_id')
      .where('ad_user', username)
      .where('ad_pass', password)
      .limit(1);
  },

  //list user (รายการลูกค้า)................................................................................................................
  getList(db) {
    return db('user').orderBy('u_id');
  },

  //list person (รายการพนักงานส่ง)
  getListperson(db) {
    return db('person').orderBy('ps_id');
  },

  //list order user (รายการออเดอร์แต่ละ user)
  getListOrderUser(db, id) {
    return db('order').orderBy('or_id', 'desc')
      .where('u_id', id)
      .where('or_status', '0')
  },

  //check order user (รายการออเดอร์ ที่รับแล้ว แต่ละ user)
  getCheckOrderUser(db, id) {
    return db('check_order').orderBy('check_id', 'desc')
      .leftJoin('order', 'check_order.or_id', 'order.or_id')
      .where('u_id', id)
      .where('or_status', '1')
  },

  //order sent user (รายการออเดอร์ ที่ส่งแล้ว แต่ละ user)
  getOrderSentUser(db, id) {
    return db('sent_order').orderBy('sent_id', 'desc')
      .leftJoin('order', 'sent_order.or_id', 'order.or_id')
      .where('u_id', id)
      .where('or_status', '2')
  },

  //list order (รายการออเดอร์ทั้งหมด)
  getListOrder(db) {
    return db('order')
      .orderBy('or_id', 'desc')
      .leftJoin('user', 'order.u_id', 'user.u_id')
      .where('or_status', '0');
  },

  //Check order (รายการออเดอร์ ที่รับแล้ว)
  getCheckOrder(db) {
    return db('check_order')
      .orderBy('check_id', 'desc')
      .leftJoin('order', 'check_order.or_id', 'order.or_id')
      .leftJoin('person', 'check_order.ps_id', 'person.ps_id')
      .leftJoin('user', 'order.u_id', 'user.u_id')
      .where('or_status', '1');
  },

  //order sent (รายการออเดอร์ ที่ส่งแล้ว)
  getOrderSent(db) {
    return db('sent_order')
      .orderBy('sent_id', 'desc')
      .leftJoin('order', 'sent_order.or_id', 'order.or_id')
      .leftJoin('person', 'sent_order.ps_id', 'person.ps_id')
      .leftJoin('user', 'order.u_id', 'user.u_id')
      .where('or_status', '2');
  },

  //Check order (รายการออเดอร์ ที่รับแล้ว ของพนักงานที่รับ)
  getCheckOrderPerson(db, id) {
    return db('check_order')
      .orderBy('check_id', 'desc')
      .leftJoin('order', 'check_order.or_id', 'order.or_id')
      .leftJoin('user', 'order.u_id', 'user.u_id')
      .where('ps_id', id)
      .where('or_status', '1');

  },

  //order sent (รายการออเดอร์ ที่ส่งแล้ว ของพนักงานที่ส่ง)
  getOrderSentPerson(db, id) {
    return db('sent_order')
      .orderBy('sent_id', 'desc')
      .leftJoin('order', 'sent_order.or_id', 'order.or_id')
      .leftJoin('user', 'order.u_id', 'user.u_id')
      .where('ps_id', id)
      .where('or_status', '2');

  },

  //order non pay (รายการออเดอร์ ที่ยังไม่ชำระเงิน)
  getNonpay(db) {
    return db('sent_order')
      .orderBy('sent_id', 'desc')
      .leftJoin('order', 'sent_order.or_id', 'order.or_id')
      .leftJoin('person', 'sent_order.ps_id', 'person.ps_id')
      .leftJoin('user', 'order.u_id', 'user.u_id')
      .where('or_status', '3');
  },

  //order non pay user(รายการออเดอร์ ที่ยังไม่ชำระเงิน ของลูกค้า)
  getNonpayuser(db, id) {
    return db('sent_order')
      .orderBy('sent_id', 'desc')
      .leftJoin('order', 'sent_order.or_id', 'order.or_id')
      .where('or_status', '3')
      .where('u_id', id)
  },

  //save data (ข้อมูลที่บันทึก)
  getSavetrack(db, id) {
    return db('save_track')
      .orderBy('track_id', 'desc')
      .where('or_id', id);
  },

  //payment user (ข้อมูลการชำระเงินลูกค้า)
  getPaymentuser(db, id) {
    return db('payment')
      .orderBy('pay_id', 'desc')
      .leftJoin('order', 'payment.or_id', 'order.or_id')
      .where('u_id', id)
      .where('or_status', '4');
  },

  //payment (ข้อมูลการชำระเงิน)
  getPayment(db) {
    return db('payment')
      .orderBy('pay_id', 'desc')
      .leftJoin('order', 'payment.or_id', 'order.or_id')
      .leftJoin('user', 'order.u_id', 'user.u_id')
      .where('or_status', '4');
  },


  //history user (ประวัติการแจ้งส่งลูกค้า)
  gethistoryuser(db, id) {
    return db('payment')
      .orderBy('pay_id', 'desc')
      .leftJoin('order', 'payment.or_id', 'order.or_id')
      .where('u_id', id)
      .where('or_status', '5');
  },

  //history (ประวัติการแจ้งส่ง)
  gethistory(db) {
    return db('payment')
      .orderBy('pay_id', 'desc')
      .leftJoin('order', 'payment.or_id', 'order.or_id')
      .leftJoin('user', 'order.u_id', 'user.u_id')
      .where('or_status', '5');
  },

  //show images (แสดงรูปภาพ)
  getOrImages(db, id) {
    return db('images')
      .where('images.or_id', id)
      .select('*');
  },

  //show images (แสดงรูปภาพ)
  getCheckImages(db, id) {
    return db('images')
      .where('images.check_id', id)
      .select('*');
  },

  //get Orderid (เก็บ id ออเดอร์)
  getOrid(db) {
    return db('order')
      .orderBy('or_id', 'desc')
      .select('order.or_id')
      .limit(1);
  },

  //get checkid (เก็บ id check)
  getcheckid(db) {
    return db('check_order')
      .orderBy('check_id', 'desc')
      .select('check_order.check_id')
      .limit(1);
  },

  //show images (แสดงรูปภาพสลีป)..................................................................................................................................................................................
  getOrImagesPm(db, id) {
    return db('payment')
      .where('payment.or_id', id)
      .select('*');
  },

  //add user (เพิ่มลูกค้า)
  register(db, data) {
    return db('user').insert(data, 'id');
  },

  //add person (เพิ่มพนักงานส่ง)
  addperson(db, data) {
    return db('person').insert(data, 'ps_id');
  },

  //add order (เพิ่มออเดอร์)
  addorder(db, data,) {
    return db('order')
      .insert(data, 'or_id')
      .leftJoin('user', 'order.or_id', 'user.u_id');
  },

  //add images (เพิ่มรูปภาพ)
  sendImages(db, data) {
    return db('images')
      .insert(data, 'img_id')
  },

  //add images (เพิ่มรูปภาพสลิป)............................................................................................
  sendImagesCheck(db, data, id) {
    return db('images')
      .where('or_id', id)
      .update(data);
  },

  //add images (เพิ่มรูปภาพสลิป)...................................................................................................................................................................
  sendImagesPayment(db, data, id) {
    return db('payment')
      .where('or_id', id)
      .update(data);
  },

  //check order (เช็คออเดอร์)
  checkorder(db, data,) {
    return db('check_order')
      .insert(data, 'check_id')
      .leftJoin('person', 'order.or_id', 'person.ps_id');
  },

  //sent order (เพิ่มข้อมูลส่ง)
  sentorder(db, data,) {
    return db('sent_order')
      .insert(data, 'sent_id');
  },

  //save track (บันทึกข้อมูล)
  savetrack(db, data,) {
    return db('save_track')
      .insert(data, 'track_id');
  },

  //payment (ชำระเงิน)
  Payment(db, data,) {
    return db('payment')
      .insert(data, 'pay_id')
  },

  //update status (อัพเดต สถานะ).........................................................................................................
  updatestatus(db, id, data) {
    return db('order')
      .where('or_id', id)
      .update(data, id);
  },

  //update date (อัพเดตวันที่ส่ง).........................................................................................................
  updatetime(db, id, data) {
    return db('check_order')
      .where('check_id', id)
      .update(data, id);
  },

  //sale total (ราคารวม).........................................................................................................
  savetotal(db, id, data) {
    return db('sent_order')
      .where('sent_id', id)
      .update(data, id);
  },

  //update images (อัพเดต รูปภาพ)
  updateimg(db, id, data) {
    return db('images')
      .where('img_id', id)
      .update(data, id);
  },

  //update password (เปลี่ยนรหัสผ่าน)
  updatepass(db, id, data) {
    return db('user')
      .where('u_id', id)
      .update(data, id);
  },

  //update informetion user (อัพเดต ข้อมูล ลูกค้า)
  update(db, id, data) {
    return db('user')
      .where('u_id', id)
      .update(data, id);
  },

  //update informetion person (อัพเดต ข้อมูล พนักงานส่ง)
  updateperson(db, id, data) {
    return db('person')
      .where('ps_id', id)
      .update(data, id);
  },

  //cancel order (ยกเลิกออเดอร์)
  removeorder(db, id) {
    return db('order')
      .where('or_id', id)
      .del();
  },

  //delete image (ลบรูปภาพออเดอร์)
  removeimg(db, id) {
    return db('images')
      .where('or_id', id)
      .del();
  },

  //delete person (ลบพนักงานส่ง)
  removeperson(db, id) {
    return db('person')
      .where('ps_id', id)
      .del();
  },

  //paypent non (ชำระเงินไม่ถูกต้อง)
  paynon(db, id) {
    return db('payment')
      .where('pay_id', id)
      .del();
  },


  //get informetion user (แสดง ข้อมูล ลูกค้า)
  getInfo(db, id) {
    return db('user')
      .where('u_id', id);
  },

  //get informetion person (แสดง ข้อมูล พนักงานส่ง)
  getInfoPerson(db, id) {
    return db('person')
      .where('ps_id', id);
  },

};
