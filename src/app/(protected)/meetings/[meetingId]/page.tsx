import React from 'react'
import IssuesList from './issues-list'

type Props = {
    params: Promise<{meetingId: string}> //new nextjs 15 feature, params are wrapped in a promise.
}

const MeetingDetailsPage = async ({params}: Props) => {
    const { meetingId } = await params
  return (
    <IssuesList meetingId={meetingId} />
  )
}

export default MeetingDetailsPage