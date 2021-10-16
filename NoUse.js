app.post('/address', async (req, res, next) => {
    try {
      var as_lat = req.body.as_lat;
      var as_lng = req.body.as_lng;
      var as_detail = req.body.as_detail;
      // var or_date = req.body.or_date;
      // var as_id = req.body.as_id;
      
      console.log(as_lat);
      console.log(as_lng);
      console.log(as_detail);
  
      // && or_date
      if (as_lat && as_lng) {
        var data = {
          as_lat: as_lat,
          as_lng: as_lng,
          as_detail: as_detail,
        };
  
  
        var rs = await model.address(db, data);
        res.send({ ok: true, id: rs[0] });
      } else {
        res.send({ ok: false, error: 'Invalid data', code: HttpStatus.INTERNAL_SERVER_ERROR });
      }
    } catch (error) {
      console.log(error);
      res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  });

  app.get('/ShowAddress',checkAuth, async (req, res, next) => {
    try {
      var rs = await model.getListAddress(db , 'SELECT * FROM address');
      res.send({ ok: true, rows: rs });
    } catch (error) {
      console.log(error);
      res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
    }
  });