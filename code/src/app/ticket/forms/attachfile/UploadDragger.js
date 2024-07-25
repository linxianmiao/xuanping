
import React from 'react'
import { Upload } from '@uyun/components'

export default function UploadDragger(props) {
  const { fileListProps } = props
  return (
    <Upload.Dragger {...fileListProps}>
      <div className="upload-dragger-wrap">
        <i className="icon-plus iconfont" />
        <span>点击或者拖拽文件到这个区域进行上传</span>
        {/* <p>仅支持{fileListProps.accept}文件格式的多个文件上传</p> */}
      </div>
    </Upload.Dragger>
  )
}
