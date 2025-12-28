export async function sendMessageWithFallback({
  content,
  receiverId,
  productRefId,
  eventRefId,
}: {
  content: string;
  receiverId: string;
  productRefId?: string;
  eventRefId?: string;
}) {
  console.log(
    "Sending ",
    content,
    "to ",
    receiverId,
    productRefId ? `with product ref ${productRefId} ` : " ",
    eventRefId ? `with event ref ${eventRefId}` : ""
  );
}
