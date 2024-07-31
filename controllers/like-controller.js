const { createErrorResponse, errorMessages } = require("../utils");
const { prisma } = require("../prisma/prisma-client");

const LikeController = {
  create: async (req, res) => {
    const userId = req.user.userId;
    const { postId } = req.body;
    if (!userId || !postId) {
      return createErrorResponse(res, 400, errorMessages.somethingWentWrong);
    }

    try {
      const existingLike = await prisma.like.findFirst({
        where: { postId: postId, userId },
      });
      if (existingLike) {
        return createErrorResponse(res, 400, errorMessages.alreadyLiked);
      }
      const like = await prisma.like.create({ data: { postId, userId } });
      res.status(200).json(like);
    } catch (error) {
      console.error(`Error with create like: ${error.message}`);
      createErrorResponse(res, 500, errorMessages.requestCrashed);
    }
  },
  delete: async (req, res) => {
    const postId = req.body.id;
    const userId = req.user.userId;
    try {
      const existingLike = await prisma.like.findFirst({
        where: {
          postId,
          userId,
        },
      });
      if (!existingLike) {
        return createErrorResponse(res, 400, errorMessages.somethingWentWrong);
      }
      const unlike = await prisma.like.deleteMany({
        where: { postId, userId },
      });
      res.status(200).json(unlike);
    } catch (error) {
      console.error(`Error with delete like: ${error.message}`);
      createErrorResponse(res, 500, errorMessages.requestCrashed);
    }
  },
};

module.exports = LikeController;
