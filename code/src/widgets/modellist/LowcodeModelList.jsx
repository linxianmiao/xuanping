import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { inject } from '@uyun/core'
import { Drawer, Spin, Empty, message } from '@uyun/components'
import Filters from './components/ModelSelect/Filters'
import { API } from './api/request/config'
import styles from './lowcode.module.less'

@observer
export default class LowcodeModelList extends Component {
  @inject('api') api

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
    data: [],
    loading: false,

    selectedModel: {},
    visible: false,
    iframeLoading: false
  }

  conditions = this.getInitialConditions()

  total = 0

  timer = null

  componentDidMount() {
    this.query(this.conditions)
  }

  componentDidUpdate(prevProps) {
    if (this.props.appkey !== prevProps.appkey) {
      this.query(this.conditions)
    }
  }

  getInitialConditions() {
    return {
      pageNo: 1,
      pageSize: 24,
      layoutId: undefined,
      collect: 0
    }
  }

  query = async conditions => {
    this.setState({ loading: true })

    const res = await this.api.queryModels(conditions)
    const data = (conditions.pageNo > 1 ? this.state.data : []).concat(res.list || [])

    this.conditions.pageNo = res.pageNum || 1
    this.total = res.total || 0
    this.setState({
      data,
      loading: false
    })
  }

  handleScroll = e => {
    const { scrollTop, scrollHeight, offsetHeight } = e.target
    const { pageNo, pageSize } = this.conditions
    // 是否到达底部
    const isBottom = scrollTop + offsetHeight >= scrollHeight

    if (this.total > (pageNo * pageSize) && isBottom && !this.state.loading) {
      this.conditions.pageNo = this.conditions.pageNo + 1
      this.timer = setTimeout(() => {
        clearTimeout(this.timer)
        this.query(this.conditions)
      }, 300)
    }
  }

  handleFilterChange = filters => {
    this.conditions = { ...this.conditions, ...filters }
    this.conditions.pageNo = 1
    this.query(this.conditions)
  }

  handleClickModel = model => {
    const w = this.windowWin || window
    w.addEventListener('message', this.handleMessage)

    this.setState({
      selectedModel: model,
      visible: true,
      iframeLoading: true
    })
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

  handleMessage = res => {
    if (res.data.createTicket === 'success') {
      // message.success(this.i18n('create.success', '创建成功'))
      this.handleClose()
    }
  }

  getIframeUrl = model => {
    const { appkey } = this.props
    return `/itsm/#/create/${model.processId}/ddd?ticketSource=portal&hideHeader=1&appkey=${appkey}`
  }

  render() {
    const { loading, data, selectedModel, visible, iframeLoading } = this.state
    const w = this.windowWin || window

    return (
      <>
        <Spin wrapperClassName={styles.mbtModelListSpin} spinning={loading}>
          <Filters onChange={this.handleFilterChange} />
          <div className={styles.mbtModelListWrap} onScroll={this.handleScroll}>
            {
              data.map(item => {

                const { iconName, processName, fileId, fileName } = item
                const imgurl = `${API}/file/downloadFile/${fileId}/${fileName}`

                return (
                  <a className={styles.modelItem} onClick={() => this.handleClickModel(item)}>
                    <div className={styles.modelItemIconWrap}>
                      {
                        iconName === 'define' ? (
                          <img src={imgurl} />
                        ) : (
                          <i className={`iconfont icon-${iconName}`} />
                        )
                      }
                    </div>
                    <p className={styles.modelItemName} title={processName}>{processName}</p>
                  </a>
                )
              })
            }
            {!loading && data.length === 0 && <Empty type="data" />}
          </div>

          <Drawer
            title={selectedModel.processName}
            visible={visible}
            onClose={this.handleClose}
            getContainer={() => w.document.body}
          >
            <Spin wrapperClassName={styles.iframeLoadingWrap} spinning={iframeLoading}>
              {
                visible && (
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
                )
              }
            </Spin>
          </Drawer>
        </Spin>
      </>
    )
  }
}
