import { Request, Response } from "express";
import { verifyWebhook } from "@clerk/express/webhooks";
import { prisma } from "../prisma/client";

export const handleWebhookEvent = async (req: Request, res: Response) => {
  try {
    const evt = await verifyWebhook(req);
    const eventType = evt.type;

    if (eventType === "user.created") {
      const { id, email_addresses, image_url } = evt.data;

      const fullName = evt.data.unsafe_metadata?.fullName as string | null;
      const collegeName = evt.data.unsafe_metadata?.collegeName as
        | string
        | null;
      const isAdmin = evt.data.unsafe_metadata?.isAdmin as boolean | undefined;

      // Split fullName into first_name and last_name
      const [first_name, ...lastNameParts] = fullName?.split(" ") || [];
      const last_name = lastNameParts.join(" ");

      // Create user in database
      await prisma.user.create({
        data: {
          clerkId: id,
          email: email_addresses[0].email_address,
          firstName: first_name || null,
          lastName: last_name || null,
          profileImageUrl: image_url,
          name: fullName?.trim() || null,
          collegeName: collegeName,
          isAdmin: isAdmin,
        },
      });
      console.log("User created in database:", first_name);
    } else if (eventType === "user.updated") {
      const { id, email_addresses, image_url } = evt.data;

      const fullName = evt.data.unsafe_metadata?.fullName as string | null;
      const collegeName = evt.data.unsafe_metadata?.collegeName as
        | string
        | null;
      const isAdmin = evt.data.unsafe_metadata?.isAdmin as boolean | undefined;

      // Split fullName into first_name and last_name
      const [first_name, ...lastNameParts] = fullName?.split(" ") || [];
      const last_name = lastNameParts.join(" ");

      // Update user in database
      await prisma.user.update({
        where: { clerkId: id },
        data: {
          email: email_addresses[0].email_address,
          firstName: first_name || null,
          lastName: last_name || null,
          profileImageUrl: image_url,
          name: fullName?.trim() || null,
          collegeName: collegeName,
          isAdmin: isAdmin,
        },
      });
      console.log("User updated in database:", first_name);
    }
    return res.status(200).json({ message: "Webhook processed successfully" });
  } catch (err) {
    console.error("Error processing webhook:", err);
    return res.status(400).json({ error: "Error processing webhook" });
  }
};
