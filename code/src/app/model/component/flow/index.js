/* eslint-disable no-case-declarations */

import React, { Component } from 'react'
import moment from 'moment'
import { Injectable, Inject } from '@uyun/everest-injectable'
import { notification, message, Select, Tooltip } from '@uyun/components'
import {
  PanelToStageModule,
  AlignmentModule,
  FlowChartDesignerModule,
  CaptureHistoryModule,
  RightClickMenuModule
} from '@uyun/everest-show'
import Config from '../../config/flowConfig'
import '../style/sideModal.less'
import '../style/flow.less'
import FlowStore from '../../store/flowStore'
import SideNodeModal from './sideNodeModal'
import SideModalTips from './sideModalTips'
import { getActiveNode, getByteLen, randomWord } from './utils'
import { observer, inject } from 'mobx-react'
import { DeleteOutlined } from '@uyun/icons'

const {
  Toolbar,
  CenterPointScale,
  RequestFullScreen,
  FlowChartDesigner,
  NODE_DROP_END,
  NODE_DARG_END,
  LINK_DARG_END,
  DELETE
} = FlowChartDesignerModule

const { PanelToStage, ShapePanel } = PanelToStageModule

const { Alignment } = AlignmentModule
const { ContextMenuService } = RightClickMenuModule

const { CaptureHistory, CaptureHistoryService } = CaptureHistoryModule

const Option = Select.Option

@inject('flowListStore')
@Injectable({ cooperate: 'mobx' })
@observer
class Test extends Component {
  constructor(props) {
    super(props)
    this.ref = React.createRef()
  }
  static displayName = 'FlowChartDesignerDemoComponent'

  @Inject(CaptureHistoryService) captureHistoryService

  @Inject(ContextMenuService) contextMenuService

  @Inject(FlowStore) flowStore

  state = {
    activeNodeId: 'false',
    visible: false,
    show: false,
    data: []
  }

  onAlign = (data) => {
    this.captureHistoryService.pushState({ nodes: data, links: this.flowStore.dataSource.links })
  }

  changeWidth = (id, value) => {
    const width = getByteLen(value)
    const ret = this.contextMenuService.setRectNodeWidth(id, width)
    for (const node of ret.nodes) {
      if (node.id === id) {
        node.text = value
      }
    }
    this.flowStore.next(ret)
  }

  onChange = ({ status, item, data }) => {
    if (
      status === 'onDelete' &&
      _.filter(
        item,
        (ite) => ite.activitiType === 'StartNoneEvent' || ite.activitiType === 'EndNoneEvent'
      ).length > 0
    ) {
      message.error(i18n('nodeAndLink', '开始和结束节点无法删除'))
      return false
    }
    const currentNodes = ['ExclusiveGateway', 'InclusiveGateway'] // 判断节点和包容节点
    switch (status) {
      /* 成图形面板拖入画布放下 */
      case NODE_DROP_END:
        data.nodes = data.nodes.map((node) => {
          if (!node.activityCode) {
            node.activityCode = randomWord()
          }
          return node
        })
        break
      /* 节点拖拽结束 */
      case NODE_DARG_END:
        break
      /* 线头尾拖拽结束 */
      case LINK_DARG_END:
        let isNew = true // 判断是新的线还是旧的线拖拽
        let approvalLink = false // 审批节点的出线只有一条
        _.map(this.flowStore.dataSource.links, (link) => {
          if (
            link.from.id === item.from.node.id &&
            item.id !== link.id &&
            item.from.node.activitiType === 'ApprovalTask'
          ) {
            approvalLink = true
          }
          if (item.id === link.id) {
            isNew = false
          }
        })
        if (approvalLink) {
          message.error(i18n('w2267', '审批节点只能有一条出线'))
          return false
        }
        data.links = data.links.map((link) => {
          let val = link
          if (link.id === item.id && isNew) {
            val = {
              text: i18n('globe.submit', '提交'),
              visibleText: true,
              attr: 'line',
              from: link.from,
              id: link.id,
              to: link.to,
              flowCode: randomWord()
            }
          }
          return val
        })
        data.nodes = data.nodes.map((node) => {
          // 人工节点，将线的变化体现在outGoings中，环节逾期策略中审批节点会用到
          if (item.from.node.activitiType === 'UserTask') {
            if (isNew) {
              node.outGoings = (node.outGoings || []).concat(item.id)
            }
          }
          // 是判断节点，并且连线成功
          if (
            node.id === item.from.id &&
            currentNodes.indexOf(item.from.node.activitiType) > -1 &&
            item.to.node &&
            item.to.node.id
          ) {
            if (isNew) {
              node.conditionRules = (node.conditionRules || []).concat([
                { name: item.to.node.text, id: item.to.id, flowId: item.id }
              ])
            } else {
              node.conditionRules.map((rule) => {
                if (rule.flowId === item.id) {
                  rule.id = item.to.id
                }
                return rule
              })
            }
          }
          return node
        })
        break
      case DELETE:
        data.nodes = data.nodes.map((node) => {
          if (node.activitiType === 'UserTask' && node.outGoings) {
            node.outGoings = node.outGoings.filter((id) =>
              data.links.some((link) => link.id === id)
            )
          }
          if (currentNodes.indexOf(node.activitiType) > -1 && node.conditionRules) {
            node.conditionRules = node.conditionRules.filter((rule) => {
              let tmp = false
              data.links.map((link) => {
                if (link.id === rule.flowId) {
                  tmp = true
                }
              })
              return tmp
            })
          }
          return node
        })
        this.setState({
          visible: false
        })
        break
      default:
        break
    }
    this.captureHistoryService.pushState(data) // 加入历史
  }

  // 隐藏侧边栏
  onCancel = () => {
    this.setState({ visible: false })
  }

  onChangeHistory = (data) => {
    if (data) {
      this.flowStore.next(data.toJS())
    } else {
      // 没有撤回的时候初始化
      this.flowStore.next(this.flowStore.defaultData)
    }
  }

  onNodeAndLineDblClick = (active, e) => {
    this.setState({
      activeNodeId: active.id,
      visible: true,
      show: false
    })
  }

  showTips = () => {
    this.setState({
      show: true,
      visible: false
    })
  }

  onCancelShow = () => {
    this.setState({
      show: false
    })
  }

  onClick = (e) => {
    this.nodeType = e.target.nodeType
  }

  closeSide = () => {
    if (this.nodeType === 'Stage') {
      this.setState({
        visible: false,
        show: false,
        activeNodeId: 'false'
      })
    }
  }

  onStageDragEnd = (data) => {
    this.flowStore.setStageAttr(data)
  }

  // 接入校验
  access = (node, link) => {
    if (link.to.node.id === link.from.node.id) {
      notification.error({
        message: i18n('conf.model.proces.lineError', '连接错误'),
        description: i18n('conf.model.proces.node', '节点不能自身相连')
      })
    } else if (link.to.node.activitiType === 'StartNoneEvent') {
      notification.error({
        message: i18n('conf.model.proces.lineError', '连接错误'),
        description: i18n('conf.model.proces.StartNoneEvent', '开始节点无法接入')
      })
      return false
    } else {
      return true
    }
  }

  // 接出校验
  output = (node) => {
    if (node.attrs.activitiType === 'EndNoneEvent') {
      notification.error({
        message: i18n('conf.model.proces.lineError', '连接错误'),
        description: i18n('conf.model.proces.EndNoneEvent', '结束节点只能接入')
      })
      return false
    } else {
      return true
    }
  }

  renderVersion = (item) => {
    const { version, status, message } = item
    let statusName = ''
    switch (status) {
      case 0:
        statusName = '历史版'
        break
      case 1:
        statusName = '使用中'
        break
      case 2:
        statusName = '设计中'
        break
    }
    return <span title={message}>{`V${version}(${statusName})`}</span>
  }

  // 修改流程图版本
  handleChangeChartVersion = (value) => {
    const { chartId } = this.props.flowListStore
    this.flowStore.getModelProcessChart(this.props.modelId, chartId, value)
  }

  render() {
    const { activeNodeId, visible, show } = this.state
    const { versionList, version } = this.flowStore
    const currentVersion = _.find(versionList, (item) => item.version === version)

    const activeNode = getActiveNode(activeNodeId, this.flowStore.dataSource)
    if (Object.keys(activeNode || {}).length === 0 && visible) {
      this.onCancel()
    }
    return (
      <PanelToStage style={{ height: '100%' }}>
        <Toolbar>
          <Alignment onAlign={this.onAlign} />
          <CenterPointScale />
          <RequestFullScreen />
          <CaptureHistory onChange={this.onChangeHistory} />
          <Tooltip title="删除">
            <div className="flow-delete-icon" onClick={() => this.ref.current.onDelete()}>
              <DeleteOutlined />
            </div>
          </Tooltip>
          <div className="help" onClick={this.showTips}>
            <i className="icon-jinggao iconfont" />
            <span>{i18n('process-help', '帮助')}</span>
          </div>

          <div className="flow-expand">
            {!_.isEmpty(currentVersion) && (
              <span>
                {i18n('model-flow-publish-time', '更新时间：{time}', {
                  time: moment(currentVersion.updateTime).format('YYYY-MM-DD HH:mm')
                })}
              </span>
            )}
            <Select
              showSearch
              value={version}
              optionFilterProp="children"
              style={{ width: 200, marginTop: 4 }}
              notFoundContent={i18n('ticket.comment.notfind', '无法找到')}
              onChange={this.handleChangeChartVersion}
            >
              {_.map(versionList, (item) => (
                <Option key={item.version} value={item.version}>
                  {this.renderVersion(item)}
                </Option>
              ))}
            </Select>
          </div>
        </Toolbar>
        <ShapePanel dataSource={this.state.data} />
        <FlowChartDesigner
          ref={this.ref}
          onNodeAndLineDblClick={this.onNodeAndLineDblClick}
          nodes={this.flowStore.dataSource.nodes}
          links={this.flowStore.dataSource.links}
          onClick={this.onClick}
          onStageDragEnd={this.onStageDragEnd}
          defaultStageAttrs={this.flowStore.defaultStageAttrs}
          output={this.output}
          access={this.access}
          onChange={this.onChange}
        />
        <SideNodeModal
          item={activeNode}
          visible={visible}
          modelId={this.props.modelId}
          onCancel={this.onCancel}
          changeVisbleKey={this.props.changeVisbleKey}
          changeWidth={this.changeWidth}
          res={this.props.res}
        />
        <SideModalTips show={show} onCancelShow={this.onCancelShow} />
      </PanelToStage>
    )
  }

  componentWillUnmount() {
    document.querySelector('.everest-statge').removeEventListener('click', this.closeSide)
    document.body.classList.add('flowChart-user-select')
  }

  componentWillMount() {
    this.flowStore.getAllParamList({ model_id: this.props.modelId, page_size: 100, page_num: 1 })
    this.flowStore.getParamFieldList()
    document.body.classList.remove('flowChart-user-select')
  }

  componentDidMount() {
    const { modelId } = this.props
    const { chartId } = this.props.flowListStore
    this.flowStore.getModelProcessChart(modelId, chartId)
    this.flowStore.getChartVersions(modelId, chartId)
    const html = document.querySelector('html')
    const s = html.setAttribute
    const _this = this
    html.setAttribute = function () {
      s.apply(this, arguments)
      _this.forceUpdate()
    }
    document.querySelector('.everest-statge').addEventListener('click', this.closeSide)
    //废弃接口
    // this.flowStore.getShapePanelData().then((res) => {
    // const data = _.cloneDeep(Config.shapePanelDataSource)
    // _.map(res, (a) => {
    //   a && Config.shapePanelDataSource1[a.type] && data.push(Config.shapePanelDataSource1[a.type])
    // })
    // data.push(Config.shapePanelDataSource1.RemoteRequest)
    // this.setState({
    //   data
    // })
    // })
    const data = _.cloneDeep(Config.shapePanelDataSource)
    this.setState({
      data
    })
  }
}

export default Test
