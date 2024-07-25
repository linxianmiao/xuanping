import React from 'react'
import { Popconfirm, Tooltip, Form } from '@uyun/components'
import moment from 'moment'
import PicturePreview from './picturePreview'
const reg = /(.*)\.(jpg|bmp|gif|ico|pcx|jpeg|tif|png|raw|tga)$/
const FormItem = Form.Item
export default class UploadFile extends React.Component {
  state = {
    currentUrl: '',
    previewVisible: false,
    visible: false
  }

  handlePreview = (currentUrl) => {
    this.setState({
      currentUrl,
      previewVisible: true,
      visible: false
    })
  }

  handleCancel = () => {
    this.setState({
      previewVisible: false
    })
  }

  onVisibleChange = (visible) => {
    this.setState({ visible })
  }

  handleDownFile = (e, item) => {
    e.stopPropagation()
    if (item.url) {
      const a = document.createElement('a')
      a.href = item.url
      a.target = '_blank'
      a.download = item.name

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

  render() {
    const {
      name,
      url,
      id,
      uploadUser,
      activityName,
      uploadTime,
      updateTime,
      canDelete = true,
      outId
    } = this.props.file
    const { previewVisible, currentUrl, visible } = this.state
    const formItemLayout = { labelCol: { span: 9 }, wrapperCol: { span: 15 } }
    const time = updateTime ? moment(updateTime).format('YYYY-MM-DD HH:mm:ss') : ''
    const title = (
      <div className="file-tooltip">
        <FormItem {...formItemLayout} label={i18n('ticket.form.uploadUser', '上传人')}>
          <span className="file-tooltip-item-content">{uploadUser}</span>
        </FormItem>
        <FormItem {...formItemLayout} label={i18n('ticket.form.uploadActivityName', '上传环节')}>
          <span className="file-tooltip-item-content">{activityName}</span>
        </FormItem>
        <FormItem {...formItemLayout} label={i18n('ticket.form.uploadTime', '上传时间')}>
          <span className="file-tooltip-item-content">{uploadTime || time}</span>
        </FormItem>
      </div>
    )
    // const fsUrl = `/store/fs/openapi/v2/view/${escape(
    //   encodeURIComponent(encodeURIComponent(`itsm/data/${outId}`))
    // )}/${name}`
    return (
      <Tooltip
        title={title}
        visible={visible}
        mouseEnterDelay={0.3}
        onVisibleChange={this.onVisibleChange}
      >
        <div className="file-tag">
          {reg.test(name) ? (
            <div
              className="file-icon"
              onClick={() => {
                this.handlePreview(url)
              }}
            >
              <img src={url} title={name} alt={name} />
            </div>
          ) : (
            // ? <Preview><img src={url} title={name} alt={name} /></Preview>
            <i className="iconfont icon-fujian1" />
          )}

          {/* <Preview fileName={name} fsUrl={fsUrl} /> */}
          {this.props.canDownload ? (
            <a onClick={(e) => this.handleDownFile(e, this.props.file)} className="file-name">
              {name}
            </a>
          ) : (
            <span className="file-name">{name}</span>
          )}
          {this.props.canUpload && canDelete && !this.props.disabled && (
            <Popconfirm
              placement="rightTop"
              title={i18n('ticket.form.uploadDel')}
              onConfirm={() => {
                this.props.handleMove(id)
              }}
            >
              <i className="iconfont icon-cha" />
            </Popconfirm>
          )}
        </div>
        <PicturePreview
          previewVisible={previewVisible}
          currentUrl={currentUrl}
          handleCancel={this.handleCancel}
        />
      </Tooltip>
    )
  }
}
