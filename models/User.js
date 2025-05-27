const { db } = require("../firebase/firebase.js");
const { v4: uuidv4 } = require("uuid");

const USERS_COLLECTION = db.collection("users");

async function createUser({ email, password, name, googleId }) {
  const uuid = uuidv4();

  const userDoc = {
    id: uuid,
    email,
    password,
    name,
    googleId,
    createdAt: new Date(),
  };

  await USERS_COLLECTION.doc(uuid).set(userDoc);
  return userDoc;
}

async function findUserByEmail(email) {
  const snapshot = await USERS_COLLECTION.where("email", "==", email)
    .limit(1)
    .get();
  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return doc.data();
}

async function findUserById(userId) {
  const doc = await USERS_COLLECTION.doc(userId).get();
  return doc.exists ? doc.data() : null;
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
};
