import React, { lazy, Suspense } from 'react'
import { Skeleton } from '@uyun/components'

const UploadModeSelect = lazy(() =>
  import(/* webpackChunkName: "uploadModeSelect" */ './UploadModeSelect')
)

export default function ModeSelect(props) {
  return (
    <Suspense fallback={() => <Skeleton />}>
      <UploadModeSelect {...props} />
    </Suspense>
  )
}
