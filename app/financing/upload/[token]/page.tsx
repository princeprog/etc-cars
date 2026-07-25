import type { Metadata } from "next"

import { PublicFinancingUploadScreen } from "@/components/financing/public-financing-upload-screen"

export const metadata: Metadata = {
  title: "Financing Upload | ETC Cars",
  robots: {
    index: false,
    follow: false,
  },
}

export default async function PublicFinancingUploadPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  return <PublicFinancingUploadScreen token={token} />
}
