import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  try {
    const loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });

    if (loggedInUser) {
      return loggedInUser;
    }

    const name = `${user.firstName} ${user.lastName}`;

    try {
      const newUser = await db.user.create({
        data: {
          clerkUserId: user.id,
          name,
          imageUrl: user.imageUrl,
          email: user.emailAddresses[0].emailAddress,
        },
      });

      return newUser;
    } catch (createError) {
      console.warn("Concurrent user creation detected or failed, checking if user exists:", createError.message);
      // Fallback query in case of concurrent insert race condition
      const fallbackUser = await db.user.findUnique({
        where: {
          clerkUserId: user.id,
        },
      });
      if (fallbackUser) {
        return fallbackUser;
      }
      throw createError;
    }
  } catch (error) {
    console.error("Error in checkUser:", error.message);
    return null;
  }
};
