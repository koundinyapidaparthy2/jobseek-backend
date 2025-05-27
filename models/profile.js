const { db } = require("../firebase/firebase");
const PROFILE_COLLECTION = db.collection("profile");

async function createOrUpdateUserProfile(userId, data) {
  const profileRef = PROFILE_COLLECTION.doc(userId);
  await profileRef.set({ ...data, updatedAt: new Date() }, { merge: true });
}

async function getUserProfile(userId) {
  const doc = await PROFILE_COLLECTION.doc(userId).get();
  return doc.exists ? doc.data() : null;
}

module.exports = {
  createOrUpdateUserProfile,
  getUserProfile,
};
