import React, { Component } from 'react'
import * as mobx from 'mobx'
import { inject, observer } from 'mobx-react'
import { Link } from 'react-router-dom'
import { store as runtimeStore } from '@uyun/runtime-react'
import { MoreOutlined } from '@uyun/icons'
import DetailButton from './detailButton'
import Process from './process'
import ProcessChart from './processChart'
import Operations from '../ticket/operations'
import TicketGuide from '~/components/ticketGuide'
import TicketTemp from '~/components/TicketTemp'
import JobInfo from './job/jobInfo'
import { message, Affix, Button, Tooltip, Tag, Dropdown } from '@uyun/components'
import { qs } from '@uyun/utils'
import './style/head.less'

/**
 *   0    没有任何权限
 *   1    搜索知识
 *   2    查看知识   (具有搜索权限)
 *   3    工单转知识（具有搜索权限）
 */

const menuConfig = {
  copy: {
    icon: 'icon-fuzhi',
    name: i18n('ticket.copy', '复制工单')
  },
  print: {
    icon: 'icon-dayin',
    name: i18n('ticket.kb.print', '打印工单')
  },
  search: {
    icon: 'icon-sousuo',
    name: i18n('ticket.kb.search', '搜索知识')
  },
  detail: {
    icon: 'icon-zhishiku',
    name: i18n('ticket.kb.detail', '查看知识')
  },
  create: {
    icon: 'icon-zhishiku',
    name: i18n('ticket.kb.create', '工单转知识')
  }
}
@inject('ticketStore', 'globalStore', 'tableListStore')
@observer
class Head extends Component {
  static defaultProps = {
    getFieldValue: () => {},
    getFieldsValue: () => {}
  }

  state = {
    isAttention: this.props.forms.isAttention ? 1 : 0, // 工单关注状态
    visible: false,
    fieldData: {},
    kb: ''
  }

  async componentDidMount() {
    const { operateType, forms } = this.props
    let kb = ''
    if (operateType === 'createTicket' || operateType === 'createTicketAlert') {
      kb = forms.isGenerateKB
    } else {
      kb = await this.props.ticketStore.isGenerateKB(forms.ticketId)
    }
    this.setState({ kb })
  }
  // WARNING! To be deprecated in React v17. Use new lifecycle static getDerivedStateFromProps instead.
  componentWillReceiveProps(nextProps) {
    if (this.props.forms.isAttention !== nextProps.forms.isAttention) {
      this.setState({ isAttention: nextProps.forms.isAttention })
    }
  }

  // 工单关注
  ticketAttention = async () => {
    const { ticketId, modelId } = this.props.forms
    const result = await this.props.ticketStore.ticketAttention(
      ticketId,
      this.state.isAttention,
      modelId
    )
    this.props.lefRefresh && this.props.lefRefresh()
    if (result === '200') {
      this.setState(
        {
          isAttention: this.state.isAttention ? 0 : 1
        },
        () => {
          message.destroy()
          if (this.state.isAttention) {
            message.success(i18n('ticket.list.attentioned', '已关注'))
          } else {
            message.success(i18n('ticket.list.unattention', '取消关注'))
          }
        }
      )
    }
  }

  // 展示流程图
  showModal = () => {
    const { parentCaseId, ticketId, tacheNo, modelId, caseId } = this.props.forms
    this.props.ticketStore.getFlowChart({
      isCreate: 0,
      ticketId,
      modelId,
      tacheNo,
      caseId: parentCaseId || caseId
    }) // parentCaseId是为了单实例子流程
    this.setState({ visible: true })
  }

  // 隐藏流程图
  hideModal = () => {
    this.setState({ visible: false })
    this.props.ticketStore.clearFlowChart()
  }

  renderProcessModal = () => {
    const { visible } = this.state
    const { detailForms, autoJobInfo, forms } = this.props
    const { ticketId, tacheNo, tacheType, modelId, caseId } = forms
    const processList = mobx.toJS(this.props.ticketStore.processList)
    if (this.props.forms.modelType === 1) {
      if (processList.constructor !== Object) {
        return null
      }
      return (
        <ProcessChart
          visible={visible}
          hideModal={this.hideModal}
          dataSource={processList}
          ticketId={ticketId}
          tacheNo={tacheNo}
          tacheType={tacheType}
          modelId={modelId}
          caseId={caseId}
          detailForms={detailForms}
          autoJobInfo={autoJobInfo}
          getDetailForms={this.props.getDetailForms}
        />
      )
    } else {
      const detail = mobx.toJS(this.props.ticketStore.detailForms)
      if (processList.length === undefined) {
        return null
      }
      return (
        <Process
          hideModal={this.hideModal}
          processList={processList}
          detail={detail}
          visible={visible}
        />
      )
    }
  }

  // 点击 提交 审阅
  ticketReview = async (data) => {
    const { ticketId, caseId } = this.props.forms
    const res = await this.props.ticketStore.saveApprove(data)
    if (res === 'approved') {
      // 刷新 处理记录、tab数据数量统计
      this.props.ticketStore.getTicketDetailTabCounts(ticketId)
      this.props.ticketStore.getProcessRecord(ticketId, undefined, caseId)
    }
    return res
  }

  destroy = () => {
    this.modal.destroy()
  }

  printForm = () => {
    const { tacheNo, tacheType, modelId, ticketId, caseId, tacheId } = this.props.forms
    const values = this.props.getFieldsValue()

    // 表格字段数据从tableListStore中拿
    this.props.tableListStore.list.forEach((store) => {
      const {
        params: { fieldCode },
        data
      } = store
      values[fieldCode] = data.map((item) => ({ ...item.rowData, rowId: item.rowId }))
    })

    // 只包含了表单中的字段值
    sessionStorage.setItem('printForm', JSON.stringify(values))
    // 整个表单的信息
    sessionStorage.setItem('printFormInfo', JSON.stringify(this.props.forms))

    const { user, theme } = runtimeStore.getState()
    const { realname, userId } = user || {}
    const url = `./process-chart.html#/print/${ticketId}?tacheId=${tacheId}&tacheNo=${tacheNo}&caseId=${caseId}&modelId=${modelId}&ticketId=${ticketId}&tacheType=${tacheType}&theme=${theme}&realname=${realname}&userId=${userId}`
    window.open(url)
  }
  handleClick = (type) => {
    if (type === 'print') {
      this.printForm()
    } else {
      this.props.handleClick(type)
    }
  }
  renderItem = (type) => {
    return (
      <span onClick={() => this.handleClick(type)} data-id="preview">
        <span>
          <i className={`iconfont ${menuConfig[type].icon}`} />
          {menuConfig[type].name}
        </span>
      </span>
    )
  }

  renderoverlay = () => {
    const { queryParams, detailForms, type, forms, ticketSource, afterSubmitAction } = this.props
    const params = {
      ...queryParams,
      formId: detailForms.formId || undefined,
      type
    }
    const { mergeTicketFlag, isCanCopy, canPrint } = forms
    const { isAttention, kb } = this.state
    let fields = []
    _.forEach(forms.formLayoutVos, (d) => {
      if (d.type === 'group') {
        fields = [...d.fieldList, ...fields]
      } else {
        _.forEach(d.tabs, (tab) => {
          fields = [...fields, ...tab.fieldList]
        })
      }
    })
    const urlSearch = new URLSearchParams(this.props?.search || '')
    const isIframe =
      window.location.href.includes('/ticketDetail/') ||
      urlSearch.get('isPostMessage') ||
      !!afterSubmitAction
    // 当前工单是否是合并子单
    const isMergedTicket = mergeTicketFlag === 1

    return (
      <div className="more-overlay">
        {/* 流程指引 */}
        {window.LOWCODE_APP_KEY ? null : (
          <TicketGuide
            params={params}
            className="iconfont-wrap"
            operateGuide={_.get(forms, 'operateGuide')}
          />
        )}
        {window.LOWCODE_APP_KEY ? null : window.location.pathname.indexOf('/ticket.html') === -1 ? (
          <div>
            <TicketTemp
              type="icon"
              fieldList={fields}
              modelId={_.get(forms, 'modelId')}
              getTicketValues={this.props.getFieldsValue}
            />
          </div>
        ) : null}
        <div>
          <span className="iconfont-wrap" onClick={this.showModal}>
            <i className="iconfont icon-liuchengtu" />
            {i18n('process', '流程图')}
          </span>
        </div>
        {!isMergedTicket && (
          <div>
            <span onClick={this.ticketAttention} className="iconfont-wrap">
              {!isAttention && <i className="iconfont icon-wodeguanzhu" />}
              {!!isAttention && <i className="iconfont icon-yiguanzhu" />}
              {!isAttention && i18n('ticket.list.attention', '关注')}
              {!!isAttention && i18n('ticket.list.attentioned', '已关注')}
            </span>
          </div>
        )}
        {window.location.pathname.indexOf('/ticket.html') === -1 && !isIframe ? (
          isCanCopy === 1 ? (
            <div>
              <span>{this.renderItem('copy')}</span>
            </div>
          ) : null
        ) : null}

        {ticketSource === 'portal' ? null : (
          <>
            {canPrint && <div>{this.renderItem('print')}</div>}
            {window.location.pathname.indexOf('/ticket.html') === -1
              ? Boolean(kb) && <div>{this.renderItem('search')}</div>
              : null}
            {kb === 2 && <div>{this.renderItem('detail')}</div>}
            {kb === 3 && <div>{this.renderItem('create')}</div>}
          </>
        )}
      </div>
    )
  }

  render() {
    const {
      ticketSource,
      forms,
      queryParams,
      operateType,
      detailForms,
      autoJobInfo,
      getAgainDetailForms
    } = this.props

    const { hasChangeAuth } = this.props.globalStore.routePermissions
    const {
      isGenerateKB: kb,
      canPrint,
      ticketId,
      mergeTicketFlag,
      isCanCopy,
      modelName,
      ticketNum
    } = forms || {}
    const { visible } = this.state
    const dilver = {
      formList: forms,
      ticketReview: this.ticketReview
    }
    // 当前工单是否是合并子单
    const isMergedTicket = mergeTicketFlag === 1

    console.log(
      'window.LOWCODE_APP_KEY',
      window.LOWCODE_APP_KEY,
      window.location.pathname.indexOf('/ticket.html')
    )
    return (
      <Affix target={() => document.getElementById('itsm-wrap')}>
        <div className="clearfix ticket-froms-head-wrap">
          <JobInfo
            detailForms={detailForms}
            autoJobInfo={autoJobInfo}
            getTicketValues={this.props.getFieldsValue}
            getDetailForms={this.props.getDetailForms}
            handleModifyTicket={(retryJob) => {
              getAgainDetailForms()
              if (retryJob === 'skip') return
              this.props.ticketStore.setProps({ retryJobStatus: retryJob })
            }}
          />
          <div className="head-left">
            <span>{modelName}</span>
            <Tag color="processing" className="flow-number">
              {ticketNum}
            </Tag>
          </div>
          <div className="head-right detail-ticket-btns">
            <DetailButton {...this.props} {...dilver} />
            {window.location.pathname.indexOf('/ticket.html') === -1
              ? !!hasChangeAuth &&
                ticketSource !== 'mergeTicket' &&
                !isMergedTicket && (
                  <Link
                    to={{
                      pathname: '/ticketChange',
                      search: qs.stringify(queryParams),
                      state: forms
                    }}
                  >
                    <Button type="primary">{i18n('modify-form-data', '修改表单数据')}</Button>
                  </Link>
                )
              : null}
            <Dropdown overlay={this.renderoverlay()} placement="bottomRight">
              <Button className="more" icon={<MoreOutlined />} />
            </Dropdown>
          </div>
          {visible && this.renderProcessModal()}
        </div>
      </Affix>
    )
  }
}
export default Head
