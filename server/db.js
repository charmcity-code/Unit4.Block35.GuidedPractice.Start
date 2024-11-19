require("dotenv").config();
const pg = require("pg");
const client = new pg.Client(process.env.DATABASE_URL);
/* TODO
  create database in TablePlus:
  acme_talent_agency_db
  
  create .env file and add database url:
  "postgres://localhost/acme_talent_agency_db"
  for windows, use this connection:
  "postgres://user:password@localhost/acme_talent_agency_db"
  */
const uuid = require("uuid");
// TODO require bcrypt

const createTables = async () => {
  const SQL = /* sql */ `
    DROP TABLE IF EXISTS user_skills;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS skills;

    CREATE TABLE users(
      id UUID PRIMARY KEY,
      username VARCHAR(20) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL
    );

    CREATE TABLE skills(
      id UUID PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE
    );

    CREATE TABLE user_skills(
      id UUID PRIMARY KEY,
      skill_id UUID REFERENCES skills(id) NOT NULL,
      user_id UUID REFERENCES users(id) NOT NULL
      /* TODO add skill-user constraint */
 
    );
  `;
  await client.query(SQL);
};

const createUser = async ({ username, password }) => {
  const SQL = /* sql */ `
    INSERT INTO users(id, username, password) VALUES($1, $2, $3) RETURNING *
  `;

  // TODO hash passwords with bcrypt
  const response = await client.query(SQL, [uuid.v4(), username, password]);
  return response.rows[0];
};

const createSkill = async ({ name }) => {
  const SQL = /* sql */ `
    INSERT INTO skills(id, name) VALUES($1, $2) RETURNING *
  `;
  const response = await client.query(SQL, [uuid.v4(), name]);
  return response.rows[0];
};

const fetchUsers = async () => {
  const SQL = /* sql */ `
    SELECT id, username FROM users
  `;
  const response = await client.query(SQL);
  return response.rows;
};

const fetchSkills = async () => {
  const SQL = /* sql */ `
    SELECT * FROM skills
  `;
  const response = await client.query(SQL);
  return response.rows;
};

const createUserSkill = async ({ user_id, skill_id }) => {
  const SQL = /* sql */ `
    INSERT INTO user_skills(id, user_id, skill_id) VALUES ($1, $2, $3) RETURNING * 
  `;
  const response = await client.query(SQL, [uuid.v4(), user_id, skill_id]);
  return response.rows[0];
};

const fetchUserSkills = async (user_id) => {
  const SQL = /* sql */ `
    SELECT *
    FROM user_skills
    WHERE user_id = $1
  `;
  const response = await client.query(SQL, [user_id]);
  return response.rows;
};

const deleteUserSkill = async ({ id, user_id }) => {
  const SQL = /* sql */ `
    DELETE
    FROM user_skills
    WHERE id = $1 AND user_id = $2
  `;
  await client.query(SQL, [id, user_id]);
};

module.exports = {
  client,
  createTables,
  createUser,
  createSkill,
  fetchUsers,
  fetchSkills,
  createUserSkill,
  fetchUserSkills,
  deleteUserSkill,
};
