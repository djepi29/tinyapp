const { assert } = require('chai');

const { generateRandomString, findUserByEmail } = require("../helpers");


const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('findUserByEmail', function() {

  it('should return a user with valid email', function() {
    const user = findUserByEmail(testUsers, "user@example.com");
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID);
  });

  it('should return null for invalid email ', function() {
    const user = findUserByEmail(testUsers, "wrongEmail@example.com");
    assert.equal(user, null);
  });
});


describe('generateRandomString', function() {

  it('should return undefined if input is not an integer', function() {
    const user = generateRandomString("10");
    assert.equal(user, undefined);
  });

});