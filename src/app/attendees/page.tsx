"use client"

import { useMemo } from "react"

import { ProfileList } from "@/app/attendees/profile-list.component"
import { SkeletonList } from "@/components/molecules/skeletons/skeleton-list"
import { PageTitle } from "@/components/ui/page-title"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination"
import { usePagination } from "@/hooks/use-pagination"
import { api } from "@/trpc/react"

const PAGE_SIZE = 8

export default function AttendeesPage() {
  const pager = usePagination()

  const profileCountRequest = api.profile.count.useQuery()
  const profilesRequest = api.attendance.page.useQuery({
    page: pager.page,
    pageSize: PAGE_SIZE,
    // todo: fetch attending conferences, and present it through a selector, which then is used to fetch the attendees
    conferenceId: "xxxxxxxxxxxxxxxxxxxxxx",
  })

  const pageNumbers = useMemo(() => {
    if (!profileCountRequest.data) {
      return []
    }

    const previousPages = [pager.page - 2, pager.page - 1].filter(
      (page) => page > 0,
    )
    const nextPages = [pager.page + 1, pager.page + 2].filter(
      (page) => page <= profileCountRequest.data / PAGE_SIZE,
    )
    return [...previousPages, pager.page, ...nextPages]
  }, [profileCountRequest.data, pager.page])

  return (
    <div>
      <PageTitle
        title={"Attendees"}
        subtitle={
          "A list of all the people who have tickets for the selected conference"
        }
      />
      {
        // todo: create a trpc loading component (with built in error displaying e.t.c)
        profilesRequest.isLoading ? (
          <SkeletonList count={PAGE_SIZE} />
        ) : (
          <ProfileList profiles={profilesRequest.data?.items ?? []} />
        )
      }
      <div
        className={
          "absolute bottom-6 left-4 right-4 rounded-full bg-background"
        }>
        <Pagination>
          <PaginationContent>
            {pageNumbers.map((pageNumber) => (
              <PaginationItem key={pageNumber}>
                <PaginationLink onClick={() => pager.setPage(pageNumber)}>
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            ))}
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
