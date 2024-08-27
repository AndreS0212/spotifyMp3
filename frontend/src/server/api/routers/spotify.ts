/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import axios from "axios";
import type { SpotifyInfo, SpotifyUrlsInfo, Video } from "~/utils/interfaces";
import { TRPCError } from "@trpc/server";

interface VideoDb {
  title: string;
  duration: string;
  channel: string;
  youtubeUrl: string;
  thumbnail: string;
}

const SpotifyGetDataRouterInputSchema = z.object({
  url: z.string(),
});

const SpotifyGetDowloandUrlRouterInputSchema = z.object({
  playlistName: z.string(),
  playlistId: z.string(),
  video: z.object({
    title: z.string(),
    duration: z.string(),
    channel: z.string(),
    url: z.string(),
    thumbnail: z.string(),
  }),
});

export const spotifyRouter = createTRPCRouter({
  getData: publicProcedure
    .input(SpotifyGetDataRouterInputSchema)
    .mutation(async (opts) => {
      const { input, ctx } = opts;
      const { url } = input;
      const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `${process.env.BACKEND_URL}/spotify`,
        headers: {
          "Content-Type": "application/json",
        },
        data: { url },
      };
      const playlist = await ctx.prisma.playlist.findUnique({
        where: { id: url.split("/playlist/")[1] },
        include: { videos: true },
      });

      if (playlist) {
        const videos: VideoDb[] = playlist.videos;

        const data: SpotifyInfo = {
          playlistName: playlist.name,
          playlistId: playlist.id,
          videos: videos.map((video) => ({
            title: video.title,
            duration: video.duration,
            channel: video.channel,
            url: video.youtubeUrl,
            thumbnail: video.thumbnail,
          })),
        };
        return data;
      }
      const response = await axios.request(config);
      const data: SpotifyInfo = response.data;

      await ctx.prisma.video.createMany({
        data: data.videos.map((video: Video) => ({
          title: video.title,
          duration: video.duration,
          channel: video.channel,
          thumbnail: video.thumbnail,
          youtubeUrl: video.url,
          playlistId: data.playlistId,
        })),
      });

      await ctx.prisma.playlist.create({
        data: {
          name: data.playlistName,
          userId: ctx.auth.sessionId ?? data.playlistId,
          id: data.playlistId,
        },
      });

      return data;
    }), // Output transformer is now passed directly to createTRPCRouter
  getDownloadUrl: publicProcedure
    .input(SpotifyGetDowloandUrlRouterInputSchema)
    .mutation(async (opts) => {
      const { input, ctx } = opts;
      const { video, playlistId, playlistName } = input;
      if (ctx.auth.sessionId === null)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to use this feature",
        });
      const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `${process.env.BACKEND_URL}/download`,
        headers: {
          "Content-Type": "application/json",
        },
        data: { playlistId, playlistName, video },
      };
      const videoDb = await ctx.prisma.video.findUnique({
        where: { youtubeUrl: video.url },
        include: { url: true, playlist: true },
      });
      if (videoDb?.url?.url) {
        const data: SpotifyUrlsInfo = {
          url: videoDb.url.url,
          youtubeUrl: videoDb.youtubeUrl,
          playlistId: videoDb.playlist.id,
        };
        return data;
      }
      const response = await axios.request(config);
      const data: SpotifyUrlsInfo = response.data;
      await ctx.prisma.url.create({
        data: {
          url: data.url,
          youtubeUrl: data.youtubeUrl,
        },
      });

      return data;
    }), // Output transformer is now passed directly to createTRPCRouter
});

export type SpotifyRouter = typeof spotifyRouter;
