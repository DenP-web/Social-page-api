const errorMessages = {
  emptyFields: "All fields are required",
  userExist: "The User already exists, please login",
  requestCrashed: "An unexpected server-side error occurred",
  loginError: "Wrong login or password",
  missingToken: "Authentication token is missing",
  invalidToken: "Invalid token",
  noAccess: "Sorry, you haven't access",
  usedEmail: "Sorry, this email is already in use",
  alreadyLiked: "This post already liked",
  alreadyLeavedConversation: "You already leave this conversation",
  somethingWentWrong: 'Sorry, something went wrong, try later',
  notFollowing: "You aren't follow this user",
  notFound: (something) => `${something} not found`,
};

module.exports = errorMessages;
