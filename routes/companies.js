const db = require("../db");
const express = require("express");
const router = express.Router();
const ExpressError = require("../expressError");


//Returns list of companies {companies: [{code, name}, ...]}
router.get("/", async function (req, res, next) {
  const result = await db.query(
    `SELECT code, name, description
      FROM companies`
  );

  return res.json({ companies: result.rows });
})

//Returns obj of a company {company: {code, name, description}}
router.get("/:code", async function (req, res, next) {

  try {
    const result = await db.query(
      `SELECT code, name, description
      FROM companies WHERE code =$1`, [req.params.code]
    );

    if (result.rows.length === 0) {
      throw new ExpressError("No such company!", 404);
    }
    return res.json({ company: result.rows });
  }

  catch(err){
    return next(err);
  }
});

//Create a company and returns new company obj {company: {code, name, description}}
router.post("/", async function(req, res, next){
  try {
    const { code, name, description } = req.body;

    const result = await db.query(
      `INSERT INTO companies (code, name, description)
        VALUES ($1, $2, $3)
          RETURNING code, name, description`,
          [code, name, description]
    );

    return res.status(201).json({ company : result.rows[0]});
  }
  catch(err){
    return next(err);
  }
});

//Update a company and returns updated company obj {company: {code, name, description}}
router.put("/:code", async function (req, res, next) {

  try {
    const result = await db.query(
      `UPDATE companies SET name=$1, description=$2
        WHERE code=$3
        RETURNING code, name, description`, 
        [req.body.name, req.body.description, req.params.code]);
  
    let company = results.rows[0];
  
    if (!company) {
      throw new ExpressError("No such company!", 404);
    }
    return res.json({ company });
  }

  catch(err){
    return next(err);
  }
});

//Delete a company and returns {status: "deleted"}
router.delete("/:code", async function (req, res, next) {

  try {
    const result = await db.query(
      `DELETE FROM companies WHERE code=$1
        RETURNING code`, [req.params.code]);
      console.log(result.rows);

    if (result.rows.length === 0) {
      throw new ExpressError("No such company!", 404);
    }
    return res.json({ status: "Deleted" });
  }

  catch(err){
    return next(err);
  }
});

module.exports = router;