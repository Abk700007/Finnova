import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return null;
    }

    // 1. Check if user already exists in database first (fast local query)
    const loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (loggedInUser) {
      return loggedInUser;
    }

    // 2. Fetch full profile from Clerk only if user is not in database
    const user = await currentUser();
    if (!user) {
      return null;
    }

    const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();

    try {
      const newUser = await db.user.create({
        data: {
          clerkUserId: user.id,
          name: name || "Finnova User",
          imageUrl: user.imageUrl,
          email: user.emailAddresses[0]?.emailAddress || "",
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
    // Rethrow Next.js dynamic server errors to let Next.js handle dynamic routes during build
    if (
      error.message?.includes("Dynamic server usage") ||
      error.digest === "DYNAMIC_SERVER_USAGE"
    ) {
      throw error;
    }
    console.error("Error in checkUser:", error.message);
    return null;
  }
};
