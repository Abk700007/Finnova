import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  try {
    // 1. Get userId using auth() which is fast (JWT check, no Clerk HTTP request)
    const { userId } = await auth();
    if (!userId) {
      return null;
    }

    // 2. Fast Path: find user in DB by clerkUserId
    let loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (loggedInUser) {
      return loggedInUser;
    }

    // 3. Slow Path: User not in DB. Retrieve profile from Clerk and sync/create
    const user = await currentUser();
    if (!user) {
      return null;
    }

    const email = user.emailAddresses?.[0]?.emailAddress;
    if (!email) {
      throw new Error("Clerk user has no email address");
    }

    const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User";

    // 4. Double check unique email constraint (avoid crash if email already exists in DB)
    const existingUserByEmail = await db.user.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      // Link the existing database user to the new clerkUserId
      loggedInUser = await db.user.update({
        where: { email },
        data: {
          clerkUserId: userId,
          name: name || existingUserByEmail.name,
          imageUrl: user.imageUrl || existingUserByEmail.imageUrl,
        },
      });
    } else {
      // Create new user in the DB
      loggedInUser = await db.user.create({
        data: {
          clerkUserId: userId,
          email,
          name,
          imageUrl: user.imageUrl,
        },
      });
    }

    return loggedInUser;
  } catch (error) {
    console.error("Error in checkUser:", error.message);
    return null;
  }
};
