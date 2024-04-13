import { eq } from "drizzle-orm"
import { type z } from "zod"

import {
  type UpdateUserProfileEventPayload,
  userEvent,
} from "@/contracts/events/user"
import { PaginationInput } from "@/contracts/pagination/pagination"
import { type PagedProfileResult } from "@/contracts/profile/paged-profiles"
import { ProfileByIdInput } from "@/contracts/profile/profile-by-id-input"
import { ProfileByUserIdInput } from "@/contracts/profile/profile-by-user-id-input"
import { UpdateUserProfileInput } from "@/contracts/profile/update-profile-input"
import { type UserProfile } from "@/contracts/profile/user-profile"
import { UserByIdInput } from "@/contracts/user/user-by-id-input"
import { db } from "@/database"
import { profiles } from "@/database/schemas"
import { sendWebhook } from "@/lib/webhook"
import { getProfileById } from "@/server/api/services/profile/get-profile-by-id"
import { getProfileByUserId } from "@/server/api/services/profile/get-profile-by-user-id"
import {
  getTotalNumberOfProfiles,
  pageProfiles,
} from "@/server/api/services/profile/page-profiles"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { waitFor } from "@/server/lib/delay/wait-for"

export const profileRouter = createTRPCRouter({
  get: protectedProcedure
    .input(ProfileByIdInput)
    .query(async ({ input }): Promise<UserProfile> => {
      return getProfileById(input)
    }),

  getByUserId: protectedProcedure
    .input(ProfileByUserIdInput)
    .query(async ({ input }): Promise<UserProfile> => {
      return getProfileByUserId(UserByIdInput.parse({ userId: input.userId }))
    }),

  me: protectedProcedure.query(async ({ ctx }): Promise<UserProfile> => {
    return getProfileByUserId(UserByIdInput.parse({ userId: ctx.user.id }))
  }),

  page: protectedProcedure
    .input(PaginationInput)
    .query(async ({ input }): Promise<PagedProfileResult> => {
      return pageProfiles(input)
    }),

  count: protectedProcedure.query(async (): Promise<number> => {
    return getTotalNumberOfProfiles()
  }),

  update: protectedProcedure
    .input(UpdateUserProfileInput)
    .mutation(async ({ input, ctx }): Promise<string> => {
      const userId = ctx.user?.id
      const profile = await getProfileByUserId(UserByIdInput.parse({ userId }))
      const profileId = profile.id

      await sendWebhook<z.infer<typeof UpdateUserProfileEventPayload>>(
        userEvent.flowType,
        userEvent.eventType.updatedProfile,
        {
          userId,
          firstName: input.firstName,
          lastName: input.lastName,
          title: input.title,
          description: input.description,
          socials: input.socials,
          company: input.company,
          avatarUrl: input.avatarUrl,
        },
      )

      const result = await waitFor(
        () =>
          db.query.profiles.findFirst({ where: eq(profiles.id, profileId) }),
        (profile) => {
          if (!profile) {
            return false
          }

          return (
            profile.firstName === input.firstName &&
            profile.lastName === input.lastName &&
            profile.title === input.title &&
            profile.description === input.description &&
            profile.socials === input.socials &&
            profile.company === input.company &&
            profile.avatarUrl === input.avatarUrl
          )
        },
      )

      if (!result) {
        throw new Error(`Profile not found`)
      }

      return result.id
    }),
})