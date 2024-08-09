const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

prisma.$use(async (params, next) => {
  // Check if the query is related to the User model
  
  if (params.model === "Conversation") {
    const result = await next(params);

    // If the result is an array (like findMany), map over each item
    if (Array.isArray(result)) {
      return result.map((conversation) => {
        conversation.participants.map((p) => delete p.password);
        return conversation;
      });
    }

    // If it's a single object (like findFirst or findUnique)
    if (result && typeof result === "object") {
      delete result.password;
    }

    return result;
  }

  // If the model is not User, just return the result as is
  return next(params);
});

module.exports = {
  prisma,
};
