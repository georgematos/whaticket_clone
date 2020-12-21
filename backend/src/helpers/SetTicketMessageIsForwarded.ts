import { getIO } from "../libs/socket";
import Message from "../models/Message";

const SetTicketMessageIsForwarded = async (
  messageId: string
): Promise<void> => {
  await Message.update(
    { isForwarded: true },
    {
      where: {
        id: messageId
      }
    }
  );

  const io = getIO();
  io.to(messageId).to("notification").emit("message", {
    action: "updateIsForwarded",
    id: messageId
  });
};

export default SetTicketMessageIsForwarded;
