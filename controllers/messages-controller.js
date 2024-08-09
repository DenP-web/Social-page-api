const { prisma } = require("../prisma/prisma-client");
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
      await prisma.message.create({
        data: {
          senderId,
          receiverId,
          message: messageContent,
          conversationId: conversation.id,
        },
      });

      res.status(200).json({ message: "Message sent successfully" });
    } catch (error) {
      console.error(`Error in MessagesController.send: ${error.message}`);
      createErrorResponse(res, 500, errorMessages.somethingWentWrong);
    }
  },

  getAllConversations: async (req, res) => {
    const senderId = req.user.userId;

    if (!senderId) {
      return createErrorResponse(res, 400, errorMessages.emptyFields);
    }

    try {
      const conversation = await prisma.conversation.findMany({
        where: {
          participantsIDs: { has: senderId },
        },
        include: { participants: true },
      });

      if (!conversation) {
        return res.status(200).json([]);
      }

      res.status(200).json(conversation);
    } catch (error) {
      console.error(
        `Error in MessagesController.getAllMessages: ${error.message}`
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
        include: { messages: true },
      });

      if(!conversation) {
        return createErrorResponse(res, 404, errorMessages.notFound('Messages'))
      }

      res.status(200).json(conversation.messages);
    } catch (error) {
      console.error(
        `Error in MessagesController.getAllMessages: ${error.message}`
      );
      createErrorResponse(res, 500, errorMessages.somethingWentWrong);
    }
  },
};

module.exports = MessagesController;
