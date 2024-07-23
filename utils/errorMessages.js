const errorMessages = {
  emptyFields: "All fields are required",
  userExist: "The User already exists, please login",
  requestCrashed: "An unexpected server-side error occurred",
  loginError: 'Wrong login or password',
  missingToken : 'Authentication token is missing',
  invalidToken: 'Invalid token',
  userNotFound: 'User not Found',
  noAccess: "Sorry, you haven't access",
  usedEmail: 'Sorry, this email is already in use'
};

module.exports = errorMessages;