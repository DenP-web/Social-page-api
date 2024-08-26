const { createErrorResponse, errorMessages } = require("../utils");
const { prisma } = require("../prisma/prisma-client");
const { getReceiverSocketId, io } = require("../socket/socket");

const FollowController = {
  create: async (req, res) => {
    const userId = req.user.userId;
    const { followingId } = req.body;
    if (!userId || !followingId || userId === followingId) {
      return createErrorResponse(res, 404, errorMessages.somethingWentWrong);
    }
    try {
      const existingFollow = await prisma.follows.findFirst({
        where: { AND: [{ followerId: userId, followingId }] },
      });
      if (existingFollow) {
        return createErrorResponse(res, 400, errorMessages.somethingWentWrong);
      }
      const follow = await prisma.follows.create({
        data: { followerId: userId, followingId },
        include: {follower: true}
      });

      const receiverSocketId = getReceiverSocketId(followingId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newFollower", follow);
      }

      res.status(200).json(follow);
    } catch (error) {
      console.error(`Error with create follow: ${error.message}`);
      createErrorResponse(res, 500, errorMessages.requestCrashed);
    }
  },
  delete: async (req, res) => {
    const followingId = req.params.id;
    const userId = req.user.userId;
    if (!followingId) {
      return createErrorResponse(res, 400, errorMessages.somethingWentWrong);
    }
    try {
      const follow = await prisma.follows.findFirst({
        where: { AND: [{ followingId, followerId: userId }] },
      });
      if (!follow) {
        return createErrorResponse(res, 404, errorMessages.notFollowing);
      }
      await prisma.follows.delete({
        where: { id: follow.id },
      });
      res.status(200).json({ message: "You successfully unfollow user" });
    } catch (error) {
      console.error(`Error with delete follow: ${error.message}`);
      createErrorResponse(res, 500, errorMessages.requestCrashed);
    }
  },
};

module.exports = FollowController;
