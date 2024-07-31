const { prisma } = require("../prisma/prisma-client");
const {
  createErrorResponse,
  errorMessages,
  indicateLike,
} = require("../utils");

const PostController = {
  create: async (req, res) => {
    const { content } = req.body;
    const { userId } = req.user;

    if (!content) {
      return createErrorResponse(res, 400, errorMessages.emptyFields);
    }

    try {
      const post = await prisma.post.create({
        data: { authorId: userId, content },
      });
      res.status(200).json(post);
    } catch (error) {
      console.error(`Error with create post: ${error.message}`);
      createErrorResponse(res, 500, errorMessages.requestCrashed);
    }
  },
  getAll: async (req, res) => {
    let userId = req.user ? req.user.userId : null;
    try {
      const posts = await prisma.post.findMany({
        include: { likes: true, author: true, comments: true },
        orderBy: { createAt: "desc" },
      });
      const transformedPosts = indicateLike(posts, userId)

      res.status(200).json({ posts: transformedPosts });
    } catch (error) {
      console.error(`Error with get all post: ${error.message}`);
      createErrorResponse(res, 500, errorMessages.requestCrashed);
    }
  },
  getById: async (req, res) => {
    const userId = req.user.userId;
    const postId = req.params.id;

    try {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        include: {
          likes: true,
          comments: { include: { user: true } },
          author: true,
        },
      });

      if (!post) {
        return createErrorResponse(res, 404, errorMessages.notFound("Post"));
      }

      const indicateLike = {
        ...post,
        likedByUser: post.likes.some((like) => like.userId === userId),
      };
      res.status(200).json({ post: indicateLike });
    } catch (error) {
      console.error(`Error get all posts: ${error.message}`);
      createErrorResponse(res, 500, errorMessages.requestCrashed);
    }
  },
  delete: async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.userId;

    const post = await prisma.post.findUnique({ where: { id: postId } });
    console.log(post);
    if (!post) {
      return createErrorResponse(res, 404, errorMessages.notFound("Post"));
    }
    if (post.authorId !== userId) {
      return createErrorResponse(res, 403, errorMessages.noAccess);
    }

    try {
      await prisma.$transaction([
        prisma.comment.deleteMany({ where: { postId } }),
        prisma.like.deleteMany({ where: { postId } }),
        prisma.post.delete({ where: { id: postId } }),
      ]);
      res.status(200).json({ message: "Post successfully deleted" });
    } catch (error) {
      console.error(`Error with delete post: ${error.message}`);
      createErrorResponse(res, 500, errorMessages.requestCrashed);
    }
  },
};

module.exports = PostController;
