import {
  Message as WbotMessage,
  MessageContent,
  MessageMedia,
  MessageSendOptions
} from "whatsapp-web.js";
import path from "path";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import GetWbotMessage from "../../helpers/GetWbotMessage";
import SerializeWbotMsgId from "../../helpers/SerializeWbotMsgId";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";

interface Request {
  body: string;
  ticket: Ticket;
  quotedMsg?: Message;
  mediaUrl?: string;
}

const sendMessage = async (
  ticket: Ticket,
  chatId: string,
  content: MessageContent,
  options?: MessageSendOptions
): Promise<WbotMessage> => {
  const wbot = await GetTicketWbot(ticket);
  const message = await wbot.sendMessage(chatId, content, options);
  return message;
};

const SendWhatsAppMessage = async ({
  body,
  ticket,
  quotedMsg,
  mediaUrl
}: Request): Promise<WbotMessage> => {
  let quotedMsgSerializedId: string | undefined;
  let sentMessage;
  const chatId = `${ticket.contact.number}@${ticket.isGroup ? "g" : "c"}.us`;
  const options = { quotedMessageId: quotedMsgSerializedId };

  if (quotedMsg) {
    await GetWbotMessage(ticket, quotedMsg.id);
    quotedMsgSerializedId = SerializeWbotMsgId(ticket, quotedMsg);
  }

  try {
    if (mediaUrl) {
      const pathName = path.join(__dirname, "..", "..", "..", "public", body);
      const media = MessageMedia.fromFilePath(pathName);
      sentMessage = sendMessage(ticket, chatId, media, options);
    } else {
      sentMessage = sendMessage(ticket, chatId, body, options);
    }

    await ticket.update({ lastMessage: body });
    return sentMessage;
  } catch (err) {
    console.log(err);
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

export default SendWhatsAppMessage;
