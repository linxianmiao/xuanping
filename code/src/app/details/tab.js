import React, { Component } from 'react'
import { toJS } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Spin, Tabs, Button } from '@uyun/components'
import Log from '../ticket/log'
import Comment from '../ticket/comment'
import RelateTicket from '../ticket/relateTicket'
import MergeTicket from '../ticket/mergeTicket'
import RemoteTicket from '../ticket/remoteTicket'
import SLA from './sla'
import OLA from './ola'
import Forms from '../ticket/forms'
import Websocket from './websocket'
import { getCookie } from '../utils'
import ErrorBoundary from '~/components/ErrorBoundary'
import { planExecuteStep } from '~/ticket/forms/utils/logic'

const TabPane = Tabs.TabPane
const Hoc = inject(
  'ticketStore',
  'resourceStore'
)(
  observer(
    class DetailTabs extends Component {
      state = {
        activeKey: this.props.forms.showJobDetail ? '6' : '1',
        errorMessage: '',
        autoLoading: false
      }

      componentDidMount() {
        this.props.ticketStore.getTicketDetailTabCounts(this.props.forms.ticketId)
        if (this.props.forms.showJobDetail) {
          window.addEventListener('message', this.cmdbPostMessage)
          window.changeSkin_hook_iframe = () => {
            const skin = getCookie('skin') || 'white'
            if (document.querySelector('#iframeId')) {
              document
                .querySelector('#iframeId')
                .contentWindow.document.querySelector('html').className = skin
            }
          }
        }
      }

      componentWillReceiveProps(nextProps) {
        if (this.props.forms.ticketId !== nextProps.forms.ticketId) {
          this.setState({
            activeKey: nextProps.forms.showJobDetail ? '6' : '1'
          })
        }
      }

      componentWillMount() {
        window.changeSkin_hook_iframe = null
      }

      componentDidUpdate(prevProps) {
        const { ticketId } = this.props.forms
        if (prevProps.forms.ticketId !== ticketId && ticketId) {
          this.props.ticketStore.getTicketDetailTabCounts(ticketId)
        }
      }

      cmdbPostMessage = async (mes) => {
        if (mes.data && mes.data.execute) {
          this.props.setBtnCanClick(false)
          await this.props.ticketStore.updateExecutionResult({
            ticketId: this.props.forms.ticketId,
            canClick: false
          })
          this.websocket.findAndModify()
        }
      }

      componentWillUnmount() {
        window.removeEventListener('message', this.cmdbPostMessage)
      }

      _renderTabPaneTitle = (tab) => {
        const { tabCounts } = this.props.ticketStore
        switch (tab) {
          case '1':
            return i18n('ticket.tabs.attr', '工单属性')
          case '2':
            return `${i18n('ticket.tabs.log', '处理记录')}(${tabCounts.processRecordTotal || 0})`
          case '7':
            return `${i18n('ticket.tabs.merge', '合并工单')}(${tabCounts.mergeTicketTotal || 0})`
          case '3':
            return `${i18n('ticket.tabs.relate', '关联工单')}(${tabCounts.relateTicketTotal || 0})`
          case '6':
            return `${i18n('ticket.tabs.remoteTicket', '远程工单')}(${
              tabCounts.relationRemoteTicketTotal || 0
            })`
          case '4':
            return `${i18n('ticket.tabs.sla', 'SLA状态')}(${tabCounts.slaRecordTotal || 0})`
          case '8':
            return `${i18n('ticket.tabs.ola', 'OLA状态')}(${tabCounts.olaRecordTotal || 0})`
          case '5':
            return `${i18n('ticket.tabs.remark', '备注')}(${tabCounts.messageTotal || 0})`
          default:
            return null
        }
      }

      getUrl = () => {
        const { sandboxId, topologyBase } = this.props.resourceStore
        const { autoCallbackUrl, autoExecuteType, appId, activityType, status } = this.props.forms
        let url = `/cmdb/config.html#/appDeployTask?callbackUrl=${autoCallbackUrl || ''}`
        if (appId) url += `&appId=${appId}` // 应用的ciid
        // auto 那边必须要沙箱id
        if (sandboxId) {
          url += `&sandboxId=${sandboxId}` // 沙箱id
        } else {
          _.forEach(toJS(topologyBase), (item) => {
            const sandboxId = item && item.resChartRelationVos && item.resChartRelationVos.sandboxId
            if (sandboxId) {
              url += `&sandboxId=${sandboxId}` // 沙箱id
              return false
            }
          })
        }
        url += `&autoExecute=${Boolean(
          status !== 2 || activityType !== 'AutomaticDelivery' || autoExecuteType === '0'
        )}` // 是否展示执行按钮
        return url
      }

      handleChangeActiveKey = (activeKey) => {
        this.setState({ activeKey })
      }

      setErrMes = (retryResult, errorMessage) => {
        this.setState({ errorMessage, autoLoading: false })
      }

      handleRefuse = async () => {
        const { ticketId, tacheId, caseId } = this.props.forms
        this.setState({ autoLoading: true })
        const res = await this.props.ticketStore.retryJob({ ticketId, tacheId, caseId })
        if (res) {
          setTimeout(() => {
            this.websocket.findAndModify()
          }, 3000)
        }
      }

      render() {
        const {
          loading,
          ticketSource,
          forms,
          getDetailForms,
          getCurrentTicketValue,
          getAgainDetailForms
        } = this.props
        const { activeKey, autoLoading, errorMessage } = this.state
        const { activityType, ticketId, existRelationRemoteTicket } = forms
        const tabPaneDilver = {
          id: ticketId,
          loading,
          activeKey
        }
        const isWebsocket = Boolean(
          (forms.status === 2 && forms.isReceiveTicket === 0 && forms.isExcutor === 1) ||
            activityType === 'AutomaticDelivery'
        )
        return (
          <div className="detail-left-content">
            <Tabs onChange={this.handleChangeActiveKey} activeKey={activeKey}>
              <TabPane forceRender tab={i18n('ticket.tabs.attr', '工单属性')} key="1">
                <Spin spinning={loading}>
                  <Forms
                    {...this.props}
                    ref={this.props.formRef}
                    id={ticketId}
                    executeStep={planExecuteStep(this.props.forms?.formLayoutVos)}
                    startNode={false}
                    relateTicketList={this.props.ticketStore.relateTicket}
                    relateSubProcessTickets={toJS(this.props.ticketStore.relateSubProcessTickets)}
                    onDetailTabChange={this.handleChangeActiveKey}
                  />
                </Spin>
              </TabPane>
              {forms.showJobDetail && (
                <TabPane tab={i18n('ticket.tabs.automation', '作业执行')} key="6">
                  <div className="ticket-tab-job-execution">
                    <Spin spinning={autoLoading}>
                      {errorMessage ? (
                        <div className="ticket-tab-automation-error-message-wrap">
                          <div style={{ backgroundImage: 'url(images/blue/err.png)' }} />
                          <div>
                            <h3>{i18n('config.trigger.tip57', '执行失败')}</h3>
                            <p>{errorMessage}</p>
                            <Button
                              type="primary"
                              onClick={() => {
                                this.handleRefuse()
                              }}
                            >
                              {i18n('golbe.refresh', '刷新')}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <iframe
                          id="iframeId"
                          src={this.getUrl()}
                          width="100%"
                          height="100%"
                          allowFullScreen="allowfullscreen"
                          scrolling="yes"
                          name="topologyIframe"
                          frameBorder={0}
                        />
                      )}
                    </Spin>
                  </div>
                </TabPane>
              )}
              <TabPane tab={this._renderTabPaneTitle('2')} key="2">
                <ErrorBoundary desc={i18n('loadFail', '加载失败')}>
                  <Log {...tabPaneDilver} caseId={forms.caseId} />
                </ErrorBoundary>
              </TabPane>
              {(!ticketSource || ticketSource === 'portal' || ticketSource === 'mergeTicket') && (
                // 坑！新建协办单弹窗和新建关联工单弹窗是同一个，必须先渲染关联工单组件
                <TabPane forceRender tab={this._renderTabPaneTitle('3')} key="3">
                  <ErrorBoundary desc={i18n('loadFail', '加载失败')}>
                    {activeKey === '3' && (
                      <RelateTicket
                        {...tabPaneDilver}
                        formList={forms}
                        getDetailForms={getDetailForms}
                        getCurrentTicketValue={getCurrentTicketValue}
                        getAgainDetailForms={getAgainDetailForms}
                        ticketSource={ticketSource}
                      />
                    )}
                  </ErrorBoundary>
                </TabPane>
              )}

              {!ticketSource && (
                <TabPane tab={this._renderTabPaneTitle('7')} key="7">
                  <ErrorBoundary desc={i18n('loadFail', '加载失败')}>
                    <MergeTicket
                      {...tabPaneDilver}
                      formList={forms}
                      getDetailForms={getDetailForms}
                    />
                  </ErrorBoundary>
                </TabPane>
              )}
              {existRelationRemoteTicket && (
                <TabPane tab={this._renderTabPaneTitle('6')} key="6">
                  <ErrorBoundary desc={i18n('loadFail', '加载失败')}>
                    <RemoteTicket {...tabPaneDilver} />
                  </ErrorBoundary>
                </TabPane>
              )}
              {(!ticketSource || ticketSource === 'portal' || ticketSource === 'mergeTicket') && (
                <TabPane tab={this._renderTabPaneTitle('4')} key="4">
                  <ErrorBoundary desc={i18n('loadFail', '加载失败')}>
                    <SLA {...tabPaneDilver} ticketSource={ticketSource} />
                  </ErrorBoundary>
                </TabPane>
              )}
              {(!ticketSource || ticketSource === 'portal' || ticketSource === 'mergeTicket') && (
                <TabPane tab={this._renderTabPaneTitle('8')} key="8">
                  <ErrorBoundary desc={i18n('loadFail', '加载失败')}>
                    <OLA {...tabPaneDilver} ticketSource={ticketSource} />
                  </ErrorBoundary>
                </TabPane>
              )}
              <TabPane tab={this._renderTabPaneTitle('5')} key="5">
                <ErrorBoundary desc={i18n('loadFail', '加载失败')}>
                  <Comment {...tabPaneDilver} />
                </ErrorBoundary>
              </TabPane>
            </Tabs>
            <Websocket
              setErrMes={this.setErrMes}
              wrappedComponentRef={(node) => {
                this.websocket = node
              }}
              setBtnCanClick={this.props.setBtnCanClick}
              setChartStatus={this.setChartStatus}
              isWebsocket={isWebsocket}
              activityType={activityType}
              id={forms.ticketId}
            />
          </div>
        )
      }
    }
  )
)
export default React.forwardRef((props, ref) => <Hoc {...props} formRef={ref} />)
