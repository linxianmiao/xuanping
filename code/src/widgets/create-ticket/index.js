import React, { Component } from 'react'
import { Provider } from 'mobx-react'
import { MemoryRouter } from 'react-router-dom'
import '~/common/common'
import 'moment/locale/zh-cn'
import globalStore from '../../app/stores/globalStore'
import modelListStore from '../../app/stores/modelListStore'
import userPickStore from '../../app/stores/userPickStore'
import permissionListStore from '../../app/stores/permissionListStore'
import loadFieldWidgetStore from '../../app/stores/loadFieldWidgetStore'
import tableListStore from '../../app/stores/tableListStore'
import ticketTemplateStore from '../../app/stores/ticketTemplateStore'
import templateListStore from '../../app/stores/templateListStore'
import '../../../public/static/fonts/iconfont.css'
import '../../../public/static/fonts/iconfont.js'
import './index.less'
import ModelList from './modelList'

function setIframeStyle() {
  const iframe = document.querySelector('#npm-itsm-create-ticket')
  iframe.addEventListener('load', function () {
    setTimeout(() => {
      const iframeWindow = iframe.contentWindow
      const targetBody = iframeWindow.document.querySelector('body')
      const targetItsmWrap = iframeWindow.document.querySelector('#itsm-wrap')
      const targetContentWrap = iframeWindow.document.querySelector('.content-wrap')
      targetItsmWrap.style.background = 'transparent'
      targetItsmWrap.style.overflow = 'auto'
      targetContentWrap.style.left = 0
      targetContentWrap.style.right = 0
      targetBody.classList.add('transparent')
    }, 500)
  })
}

class NpmCreateTicket extends Component {
  static defaultProps = {
    filterType: []
  }

  state = {
    showType: 'model',
    iframeSrc: ''
  }

  itsmPostMessage = (res) => {
    if (res && res.data && res.data.createTicket === 'success') {
      if (this.state.showType === 'create') {
        this.setState({ showType: 'model', iframeSrc: '' })
      }
    }
  }

  componentDidMount() {
    window.TICKET_QUERY = {}
    window.LOWCODE_APP_KEY = this.props.appKey || this.props.appkey
    window.addEventListener('message', (res) => this.itsmPostMessage(res))
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      this.setState({ showType: 'model', iframeSrc: '' })
    }
  }

  componentWillUnmount() {
    window.LOWCODE_APP_KEY = ''
    window.removeEventListener('message', (res) => this.itsmPostMessage(res))
  }

  handleClickModel = (key) => {
    const appkey = this.props.appKey || this.props.appkey
    const src = appkey
      ? `/itsm/#/create/${key}/ddd?ticketSource=portal&hideHeader=1&appkey=${appkey}`
      : `/itsm/#/create/${key}/ddd?ticketSource=portal&hideHeader=1`
    this.setState({ showType: 'create', iframeSrc: src }, () => {
      setIframeStyle()
    })
  }

  render() {
    const appkey = this.props.appKey || this.props.appkey
    const { showType, iframeSrc } = this.state
    return (
      <div className="npm-create-ticket">
        <Provider
          globalStore={globalStore}
          modelListStore={modelListStore}
          userPickStore={userPickStore}
          permissionListStore={permissionListStore}
          loadFieldWidgetStore={loadFieldWidgetStore}
          tableListStore={tableListStore}
          ticketTemplateStore={ticketTemplateStore}
          templateListStore={templateListStore}
        >
          <MemoryRouter>
            <div className="npm-create-ticket-content">
              {showType === 'model' ? (
                <ModelList
                  handleClickModel={this.handleClickModel}
                  processCodes={this.props.processCodes}
                  appkey={appkey}
                />
              ) : null}
              {showType === 'create' ? (
                <iframe
                  style={{ minHeight: 'inherit' }}
                  title="创建工单"
                  src={iframeSrc}
                  id="npm-itsm-create-ticket"
                  width="100%"
                  height="100%"
                  allowFullScreen="allowfullscreen"
                  scrolling="yes"
                  frameBorder={0}
                />
              ) : null}
            </div>
          </MemoryRouter>
        </Provider>
      </div>
    )
  }
}

export default NpmCreateTicket
