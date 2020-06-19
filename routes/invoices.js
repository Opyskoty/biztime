const db = require("../db");
const express = require("express");
const router = express.Router();
const ExpressError = require("../expressError");
const { route } = require("./companies");
//const { route } = require("./companies");

router.get("/", async function(req, res, next) {
  const result = await db.query(
    `SELECT id, comp_code, amt
     FROM invoices`
  );
  return res.json({ invoices : result.rows });
})

router.get("/:id", async function (req, res, next) {

  try {
    const result = await db.query(
      `SELECT id, comp_code, amt, paid, add_date, paid_date,
              companies.name, companies.description
      FROM invoices
      JOIN companies ON invoices.comp_code = companies.code
      WHERE id = $1`, [req.params.id]);
    
    let data = result.rows[0];

    if(!data) {
      throw new ExpressError("No such invoice!", 404);
    }
    
    const invoice = { id : data.id, amt : data.amt, paid : data.paid,
                      add_date: data.add_date, paid_date : data.paid_date,
                    company: {code: data.comp_code, name : data.name,
                              description : data.description} };

    return res.json({ invoice : invoice })

  } catch(err) {
    return next(err);  
  }
})

router.post("/", async function(req, res, next) {
  const {comp_code, amt } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO invoices (comp_code, amt)
      VALUES ($1, $2)
      RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [comp_code, amt]
    );
    
    return res.status(201).json({ invoice : result.rows[0]});
  } catch(err) {
    return next(err);
  }
});

router.put("/:id", async function(req, res, next) {

  const { amt } = req.body;
  try {
    const result = await db.query(
      `UPDATE invoices
       SET amt=$1
       WHERE id=$2
       RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [amt, req.params.id]
    );

    let invoice = result.rows[0];

    if(!invoice) {
      throw new ExpressError("No such invoice!", 404);
    }
    return res.json({ invoice : invoice });

  } catch(err) {
    return next(err);
  }
})

router.delete("/:id", async function(req, res, next) {

  try {
    const result = await db.query(
      `DELETE FROM invoices WHERE id=$1
       RETURNING id`, [req.params.id]);
  
    if (result.rows.length === 0) {
      throw new ExpressError("No such company!", 404);
    }
    return res.json({ status: "Deleted" });
  
  } catch(err) {
      return next(err);
  }
});

module.exports = router;