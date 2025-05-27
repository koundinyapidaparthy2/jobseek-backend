const { db } = require("../firebase/firebase");

const STATUS_COLLECTION = db.collection("resumeStatus");

async function setResumeStatus(userId, statusObj) {
  return STATUS_COLLECTION.doc(userId).set({
    ...statusObj,
    updatedAt: new Date(),
  });
}

async function getResumeStatus(userId) {
  const doc = await STATUS_COLLECTION.doc(userId).get();
  return doc.exists ? doc.data() : null;
}

module.exports = {
  setResumeStatus,
  getResumeStatus,
};
