const {
  client,
  createTables,
  createUser,
  createSkill,
  fetchUsers,
  fetchSkills,
  createUserSkill,
  fetchUserSkills,
  deleteUserSkill,
} = require("./db");

const express = require("express");
const app = express();

app.use(express.json());
app.use(require("morgan")("dev"));

app.get("/api/users", async (req, res, next) => {
  try {
    res.send(await fetchUsers());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/skills", async (req, res, next) => {
  try {
    res.send(await fetchSkills());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/users/:id/userSkills", async (req, res, next) => {
  try {
    res.send(await fetchUserSkills(req.params.id));
  } catch (ex) {
    next(ex);
  }
});

app.post("/api/users/:id/userSkills", async (req, res, next) => {
  try {
    res.status(201).send(
      await createUserSkill({
        user_id: req.params.id,
        skill_id: req.body.skill_id,
      })
    );
  } catch (ex) {
    next(ex);
  }
});

app.delete("/api/users/:userId/userSkills/:id", async (req, res, next) => {
  try {
    await deleteUserSkill({ user_id: req.params.userId, id: req.params.id });
    res.sendStatus(204);
  } catch (ex) {
    next(ex);
  }
});

const init = async () => {
  await client.connect();
  console.log("connected to database");

  await createTables();
  console.log("tables created");

  const [logan, chase, lincoln, boots, running, barking, dogTricks, meowing] =
    await Promise.all([
      createUser({ username: "logan", password: "password1" }),
      createUser({ username: "chase", password: "password2" }),
      createUser({ username: "lincoln", password: "password3" }),
      createUser({ username: "boots", password: "password4" }),
      createSkill({ name: "running" }),
      createSkill({ name: "barking" }),
      createSkill({ name: "dogTricks" }),
      createSkill({ name: "meowing" }),
    ]);

  const userSkills = await Promise.all([
    createUserSkill({ user_id: logan.id, skill_id: running.id }),
    createUserSkill({ user_id: logan.id, skill_id: dogTricks.id }),
    createUserSkill({ user_id: chase.id, skill_id: running.id }),
    createUserSkill({ user_id: chase.id, skill_id: barking.id }),
    createUserSkill({ user_id: chase.id, skill_id: meowing.id }),
    createUserSkill({ user_id: lincoln.id, skill_id: barking.id }),
    createUserSkill({ user_id: lincoln.id, skill_id: dogTricks.id }),
    createUserSkill({ user_id: boots.id, skill_id: meowing.id }),
  ]);

  console.log("data seeded");

  // get user skills
  console.log(`curl localhost:3000/api/users/${lincoln.id}/userSkills`);
  const firstSkillId = (await fetchUserSkills(lincoln.id))[0].id;

  // create user skill
  console.log(
    `curl -X POST localhost:3000/api/users/${lincoln.id}/userSkills -d '{"skill_id": "${running.id}"}' -H 'Content-Type:application/json'`
  );

  // delete first user skill
  console.log(
    `curl -X DELETE localhost:3000/api/users/${lincoln.id}/userSkills/${firstSkillId}`
  );

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`listening on port ${port}`));
};

init();
