// import { z } from "zod";
// import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// // Define the input schema using Zod

// export const userRouter = createTRPCRouter({
//   createUser: publicProcedure
//     .input(
//       z.object({
//         email: z.string().email(),
//         name: z.string(),
//       })
//     )
//     .mutation((opts) => {

//       // const upsertUser = opts.ctx.prisma.users.upsert({
//       //   where: {
//       //     email,
//       //   },
//       //   update: {},
//       //   create: {
//       //     email,
//       //     name,
//       //   },
//       // });

//       // return upsertUser;
//     }),
// });
