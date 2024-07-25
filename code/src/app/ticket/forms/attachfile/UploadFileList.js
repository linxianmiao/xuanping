import React, { useState, Fragment } from 'react'
import { Tooltip, Form } from '@uyun/components'
import UploadFile from './UploadFile'
import Preview from './Preview'
import PicturePreview from './picturePreview'
import moment from 'moment'
const reg = /(.*)\.(jpg|bmp|gif|ico|pcx|jpeg|tif|png|raw|tga)$/

const FormItem = Form.Item

export default function UploadFileList(props) {
  const { value: fieldList, fileTemplate, ...rest } = props
  const [url, setUrl] = useState('')
  const [currentUrl, setCurentUrl] = useState('')
  const [previewVisible, setPreviewVisible] = useState(false)

  function handlePreview(url) {
    setUrl(url)
  }
  const handleDownFile = (e, url, name) => {
    e.stopPropagation()
    if (url) {
      const a = document.createElement('a')
      a.href = url
      a.target = '_blank'
      a.download = name

      const xhr = new XMLHttpRequest()
      xhr.responseType = 'blob'

      xhr.onload = function () {
        a.href = URL.createObjectURL(xhr.response)

        document.body.appendChild(a)
        a.click()
        a.remove()
      }

      xhr.open('GET', a.pathname)
      xhr.send()
    }
  }
  const handlePreviewTemp = (currentUrl) => {
    setCurentUrl(currentUrl)
    setPreviewVisible(true)
  }

  const handleCancel = () => {
    setPreviewVisible(false)
  }

  const renderTitle = (uploadUser, uploadTime) => {
    const formItemLayout = { labelCol: { span: 9 }, wrapperCol: { span: 15 } }
    return (
      <div className="file-tooltip">
        <FormItem {...formItemLayout} label={i18n('ticket.form.uploadUser', '上传人')}>
          <span className="file-tooltip-item-content">{uploadUser}</span>
        </FormItem>
        <FormItem {...formItemLayout} label={i18n('ticket.form.uploadTime', '上传时间')}>
          <span className="file-tooltip-item-content">{uploadTime}</span>
        </FormItem>
      </div>
    )
  }
  return (
    <Fragment>
      <div className="file-tag-list">
        {_.map(fileTemplate, (item) => {
          const url = `${API.DOWNLOAD}/${item.id}/${encodeURIComponent(item.name)}`
          const updateTime = item.updateTime
            ? moment(item.updateTime).format('YYYY-MM-DD HH:mm:ss')
            : ''
          return (
            <Tooltip
              key={item.uid}
              title={renderTitle(item.uploadUser, item.uploadTime || updateTime)}
            >
              {reg.test(item.name) ? (
                <a
                  className="file-template"
                  onClick={() => {
                    handlePreviewTemp(url)
                  }}
                >
                  {item.name}
                </a>
              ) : (
                <a className="file-template" onClick={(e) => handleDownFile(e, url, item.name)}>
                  {item.name}
                </a>
              )}
            </Tooltip>
          )
        })}
        {fieldList && fieldList.includes('#不支持导出的类型#')
          ? null
          : _.chain(fieldList)
              .filter((item) => item.source !== 'ufs')
              .map((file) => {
                const url = `${API.DOWNLOAD}/${file.id}/${escape(encodeURIComponent(file.name))}`
                return (
                  <UploadFile
                    {...rest}
                    key={file.id}
                    handlePreview={handlePreview}
                    file={_.assign({}, file, { url })}
                  />
                )
              })
              .value()}
      </div>
      <Preview url={url} visible={Boolean(url)} handlePreview={handlePreview} />
      <PicturePreview
        previewVisible={previewVisible}
        currentUrl={currentUrl}
        handleCancel={handleCancel}
      />
    </Fragment>
  )
}
