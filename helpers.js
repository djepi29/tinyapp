// ID generator 
const generateRandomString = (sliceNumber) => {
  const generator = Math.random().toString(36).slice(sliceNumber);
  return generator;
}

// user search by email 
function findUserByEmail(users, targetEmail) {
  for (const userID in users) {
    const user = users[userID];
    if (user.email === targetEmail) {
      return user;
    }
  }
  return null;
};

module.exports = {
  generateRandomString,
  findUserByEmail
}