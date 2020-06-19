process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testComp;
beforeEach(async function() {
  let result = await db.query(
    `INSERT INTO companies (code, name, description)
     VALUES ('glsr', 'glossier', 'millennial beauty')
     RETURNING code, name, description`
  );
  testComp = result.rows[0];
  console.log("helloooooooo", testComp);
});

afterEach(async function() {
  // delete any data created by test
  await db.query("DELETE FROM companies");
});

afterAll(async function() {
  // close db connection
  await db.end();
});

describe("GET /companies", function() {
  test("Gets a list of companies", async function() {
    const response = await request(app).get(`/companies`);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      companies : [testComp]
    });
  });
});

describe("POST /companies", function() {
  test("Creates a new company", async function() {
    const response = await request(app)
      .post(`/companies`)
      .send({
        code: "ther",
        name: "theranos",
        description: "the blood revolution"
      });
    expect(response.statusCode).toEqual(201);
    expect(response.body).toEqual({
      company: {code: "ther", name: "theranos", 
                  description: "the blood revolution"}
    });
  });
});

