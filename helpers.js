

// ID generator
const generateRandomString = (sliceNumber) => {
  if (!Number.isInteger(sliceNumber)) return undefined;
  const generator = Math.random().toString(36).slice(sliceNumber);
  return generator;
};

// user search by email
function findUserByEmail(users, targetEmail) {
  for (const userID in users) {
    const user = users[userID];
    if (user.email === targetEmail) {
      return user;
    }
  }
  return null;
}

const urlsForUser = function(urlDatabase, id) {
  const userUrls = {};
  for (let shortUrl in urlDatabase) {
    if (urlDatabase[shortUrl].userID === id) {
      userUrls[shortUrl] = urlDatabase[shortUrl];
    }
  }
  return userUrls;
};

module.exports = {
  generateRandomString,
  findUserByEmail,
  urlsForUser
};