import React from 'react'
import { Progress } from '@uyun/components'

export default function UploadProcess(props) {
  const { fileProcessList } = props
  return (
    <div className="file-process-list">
      {
        _.chain(fileProcessList)
          .filter(item => item.isShow)
          .map(item => (
            <div key={item.uid}>
              <span title={item.name} className="file-name">{item.name}</span>
              <Progress percent={item.progress} />
            </div>
          ))
          .value()
      }
    </div>
  )
}