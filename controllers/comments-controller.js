const { prisma } = require("../prisma/prisma-client");
const { createErrorResponse, errorMessages } = require("../utils");

const CommentsController = {
  create: async (req, res) => {
    const { content, postId } = req.body;
    const { userId } = req.user;

    if (!content || !postId) {
      return createErrorResponse(res, 400, errorMessages.emptyFields);
    }
    try {
      const comment = await prisma.comment.create({
        data: {
          content,
          userId,
          postId,
        },
      });
      res.status(200).json(comment);
    } catch (error) {
      console.error(`Error with create comment: ${error.message}`);
      createErrorResponse(res, 500, errorMessages.requestCrashed);
    }
  },
  delete: async (req, res) => {
    const commentId = req.params.id;
    const userId = req.user.userId;

    try {
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
      });
      if (!comment) {
        return createErrorResponse(res, 404, errorMessages.notFound("Comment"));
      }
      if (comment.userId !== userId) {
        return createErrorResponse(res, 403, errorMessages.noAccess);
      }

      await prisma.comment.delete({ where: { id: commentId } });
      res.status(200).json({ message: "Comment successfully deleted" });
    } catch (error) {
      console.error(`Error with delete comment: ${error.message}`);
    }
  },
};

module.exports = CommentsController;
