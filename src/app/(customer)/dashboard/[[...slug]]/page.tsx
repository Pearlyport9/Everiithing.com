import { notFound } from 'next/navigation'
import DashboardView from '../_views/dashboard-view'
import BookingsView from '../_views/bookings-view'
import BookServiceView from '../_views/book-service-view'
import ProfileView from '../_views/profile-view'

const viewMap: Record<string, React.ReactNode> = {
  bookings: <BookingsView />,
  book: <BookServiceView />,
  profile: <ProfileView />,
}

type Params = Promise<{ slug?: string[] }>

export default async function DashboardPage({ params }: { params: Params }) {
  const { slug } = await params
  const viewKey = slug?.[0]

  if (!viewKey) {
    return <DashboardView />
  }

  const component = viewMap[viewKey]
  if (!component) {
    notFound()
  }

  return <>{component}</>
}
