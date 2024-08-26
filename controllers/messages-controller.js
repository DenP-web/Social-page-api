const { prisma } = require("../prisma/prisma-client");
const { getReceiverSocketId, io } = require("../socket/socket");
const { createErrorResponse, errorMessages } = require("../utils");

const MessagesController = {
  send: async (req, res) => {
    const receiverId = req.params.id;
    const senderId = req.user.userId;
    const messageContent = req.body.message;

    if (!messageContent || !receiverId || !senderId) {
      return createErrorResponse(res, 400, errorMessages.emptyFields);
    }

    try {
      // Find or create a conversation
      let conversation = await prisma.conversation.findFirst({
        where: {
          AND: [
            { participantsIDs: { has: senderId } },
            { participantsIDs: { has: receiverId } },
          ],
        },
      });

      if (!conversation) {
        // Create a new conversation if none exists
        conversation = await prisma.conversation.create({
          data: {
            participantsIDs: [receiverId, senderId],
          },
          include: { messages: true },
        });
      }

      // Check and update conversationIDs for the users if needed
      const [senderUser, receiverUser] = await Promise.all([
        prisma.user.findFirst({
          where: { id: senderId, conversationIDs: { has: conversation.id } },
        }),
        prisma.user.findFirst({
          where: { id: receiverId, conversationIDs: { has: conversation.id } },
        }),
      ]);

      const updatePromises = [];
      if (!senderUser) {
        updatePromises.push(
          prisma.user.update({
            where: { id: senderId },
            data: { conversationIDs: { push: conversation.id } },
          })
        );
      }

      if (!receiverUser) {
        updatePromises.push(
          prisma.user.update({
            where: { id: receiverId },
            data: { conversationIDs: { push: conversation.id } },
          })
        );
      }

      await Promise.all(updatePromises);

      // Create the message
      const newMessage = await prisma.message.create({
        data: {
          senderId: senderId,
          receiverId: receiverId,
          message: messageContent,
          conversationId: conversation.id,
        },
        include: {
          sender: true, // Include the full sender data
        },
      });

      const updatedConversation = await prisma.conversation.findFirst({
        where: {
          id: conversation.id,
        },
        include: { messages: true },
      });

      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
      }

      res.status(200).json(updatedConversation.messages);
    } catch (error) {
      console.error(`Error in MessagesController.send: ${error.message}`);
      createErrorResponse(res, 500, errorMessages.somethingWentWrong);
    }
  },

  getAllConversations: async (req, res) => {
    const userId = req.user.userId;

    try {
      let user = await prisma.user.findFirst({
        where: { id: userId },
        include: { conversations: { include: { participants: true } } },
      });

      if (!user.conversations) {
        return res.status(200).json([]);
      }

      res.status(200).json(user.conversations);
    } catch (error) {
      console.error(
        `Error in MessagesController.getAllConversations: ${error.message}`
      );
      createErrorResponse(res, 500, errorMessages.somethingWentWrong);
    }
  },

  getAllMessages: async (req, res) => {
    const senderId = req.user.userId;
    const conversationId = req.params.id;

    if (!senderId) {
      return createErrorResponse(res, 400, errorMessages.emptyFields);
    }

    try {
      const conversation = await prisma.conversation.findFirst({
        where: {
          AND: [{ id: conversationId }, { participantsIDs: { has: senderId } }],
        },
        include: { messages: { include: { sender: true, receiver: true } } },
      });

      if (!conversation) {
        return createErrorResponse(
          res,
          404,
          errorMessages.notFound("Messages")
        );
      }

      res.status(200).json(conversation.messages);
    } catch (error) {
      console.error(
        `Error in MessagesController.getAllMessages: ${error.message}`
      );
      createErrorResponse(res, 500, errorMessages.somethingWentWrong);
    }
  },

  createConversation: async (req, res) => {
    const receiverId = req.params.id;
    const senderId = req.user.userId;

    if (!receiverId || !senderId) {
      return createErrorResponse(res, 400, errorMessages.emptyFields);
    }

    try {
      // Find or create a conversation
      let conversation = await prisma.conversation.findFirst({
        where: {
          AND: [
            { participantsIDs: { has: senderId } },
            { participantsIDs: { has: receiverId } },
          ],
        },
      });

      if (!conversation) {
        // Create a new conversation if none exists
        conversation = await prisma.conversation.create({
          data: {
            participantsIDs: [receiverId, senderId],
          },
          include: { messages: true },
        });
      }

      // Check and update conversationIDs for the users if needed
      const [senderUser, receiverUser] = await Promise.all([
        prisma.user.findFirst({
          where: { id: senderId, conversationIDs: { has: conversation.id } },
        }),
        prisma.user.findFirst({
          where: { id: receiverId, conversationIDs: { has: conversation.id } },
        }),
      ]);

      const updatePromises = [];
      if (!senderUser) {
        updatePromises.push(
          prisma.user.update({
            where: { id: senderId },
            data: { conversationIDs: { push: conversation.id } },
          })
        );
      }

      if (!receiverUser) {
        updatePromises.push(
          prisma.user.update({
            where: { id: receiverId },
            data: { conversationIDs: { push: conversation.id } },
          })
        );
      }

      await Promise.all(updatePromises);

      let updatedConversation = await prisma.conversation.findFirst({
        where: {
          id: conversation.id,
        },
        include: { messages: true, participants: true },
      });

      res.status(200).json(updatedConversation);
    } catch (error) {
      console.error(
        `Error in MessagesController.createConversation: ${error.message}`
      );
      createErrorResponse(res, 500, errorMessages.somethingWentWrong);
    }
  },

  leaveConversation: async (req, res) => {
    const userId = req.user.userId;
    const conversationId = req.params.id;

    if (!conversationId) {
      return createErrorResponse(res, 404, errorMessages.somethingWentWrong);
    }

    try {
      const user = await prisma.user.findFirst({
        where: {
          AND: [{ id: userId }, { conversationIDs: { has: conversationId } }],
        },
      });

      if (!user) {
        return createErrorResponse(
          res,
          404,
          errorMessages.alreadyLeavedConversation
        );
      }

      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          conversationIDs: {
            set: user.conversationIDs.filter((id) => id !== conversationId),
          },
        },
      });

      const conversationInUse = await prisma.user.findMany({
        where: { conversationIDs: { has: conversationId } },
      });

      if (!conversationInUse.length) {
        await prisma.message.deleteMany({
          where: {
            conversationId: conversationId,
          },
        });

        await prisma.conversation.delete({ where: { id: conversationId } });
      }

      res
        .status(200)
        .json({ message: "You have left the conversation successfully" });
    } catch (error) {
      console.error(
        `Error in MessagesController.leaveConversation: ${error.message}`
      );
      createErrorResponse(res, 500, errorMessages.somethingWentWrong);
    }
  },
};

module.exports = MessagesController;
