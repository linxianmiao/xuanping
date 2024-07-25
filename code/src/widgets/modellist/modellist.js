import { observer } from 'mobx-react'
import { inject } from '@uyun/core'
import React, { Component, Fragment } from 'react'
import { Drawer, Spin, Empty, message } from '@uyun/components'
// import LowcodeModelList from './LowcodeModelList'
import { API } from './api/request/config'
import { ModellistStore } from './modellist.store'
import styles from './modellist.module.less'

export class Modellist extends Component {
  render() {
    // const { appkey } = this.props

    // if (appkey === undefined) {
    //   return <PortalModellist {...this.props} />
    // } else {
    //   window.LOWCODE_APP_KEY = appkey
    //   return <LowcodeModelList {...this.props} />
    // }
    return <PortalModellist {...this.props} />
  }
}

@observer
class PortalModellist extends Component {
  @inject(ModellistStore) store

  @inject('widget') widget

  @inject('i18n') i18n

  constructor(props, context) {
    super(props, context)

    if (this.widget) {
      this.windowWin = this.widget.getContextWindow()
    }

    if (this.widget && this.widget.setWidgetConfigPortalProps) {
      this.widget.setWidgetConfigPortalProps({
        notModalPadding: true
      })
    }
  }

  state = {
    selectedModel: {},
    visible: false,
    iframeLoading: false
  }

  componentDidMount() {
    this.store.getSelectedModels()
  }

  handleClose = () => {
    const w = this.windowWin || window
    w.removeEventListener('message', this.handleMessage)

    this.setState({
      selectedModel: {},
      visible: false,
      iframeLoading: false
    })
  }

  handleClickModel = (model) => {
    const w = this.windowWin || window
    w.addEventListener('message', this.handleMessage)

    this.setState({
      selectedModel: model,
      visible: true,
      iframeLoading: true
    })
  }

  handleMessage = (res) => {
    if (res.data.createTicket === 'success') {
      message.success(this.i18n('create.success', '创建成功'))
      this.handleClose()
    }
  }

  getIframeUrl = (model) => {
    return `/itsm/#/create/${model.processId}/ddd?ticketSource=portal&hideHeader=1`
  }

  renderItem(model) {
    const { iconName, processName, fileId, fileName } = model
    const imgurl = `${API}/file/downloadFile/${fileId}/${fileName}`

    return (
      <a className={styles.modelItem} onClick={() => this.handleClickModel(model)}>
        <div className={styles.modelItemIconWrap}>
          {iconName === 'define' ? (
            <img src={imgurl} />
          ) : (
            <i className={`iconfont icon-${iconName}`} />
          )}
        </div>
        <p className={styles.modelItemName} title={processName}>
          {processName}
        </p>
      </a>
    )
  }

  render() {
    const { models, loading } = this.store
    const { selectedModel, visible, iframeLoading } = this.state
    const w = this.windowWin || window

    return (
      <Fragment>
        <div className={styles.itsmModellist}>
          <Spin wrapperClassName={styles.modelListLoadingWrap} spinning={loading}>
            {models.length > 0 ? (
              models.map((item) => this.renderItem(item))
            ) : (
              <Empty type="data" />
            )}
          </Spin>
        </div>
        <Drawer
          title={selectedModel.processName}
          visible={visible}
          onClose={this.handleClose}
          getContainer={() => w.document.body}
          className={styles.drawerIframe}
        >
          <Spin wrapperClassName={styles.iframeLoadingWrap} spinning={iframeLoading}>
            {visible && (
              <iframe
                src={this.getIframeUrl(selectedModel)}
                id="iframeId"
                width="100%"
                height="100%"
                allowFullScreen="allowfullscreen"
                scrolling="yes"
                frameBorder={0}
                onLoad={() => {
                  this.setState({ iframeLoading: false })
                }}
              />
            )}
          </Spin>
        </Drawer>
      </Fragment>
    )
  }
}
