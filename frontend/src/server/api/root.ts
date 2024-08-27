import { createTRPCRouter } from "~/server/api/trpc";
import { playlistsRouter } from "./routers/playlists";
// import { userRouter } from "./routers/users";
import { spotifyRouter } from "./routers/spotify";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  playlists: playlistsRouter,
  // users: userRouter,
  spotify: spotifyRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
