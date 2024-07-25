import React, { Component, lazy } from 'react'
import { qs } from '@uyun/utils'
import { ArrowsAltOutlined } from '@uyun/icons'
import { Modal, Tag, Spin } from '@uyun/components'
import { formatFlowChartData, ProcessStatus, NODE_STATUS } from './util.js'

const FlowChart = lazy(() => import(/* webpackChunkName: "flowChart" */ './flowChart'))
class SubProcessChart extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: {
        nodes: [],
        links: []
      },
      show: true,
      showSub: false,
      subData: this.props.subData
    }
  }

  componentDidMount() {
    this.getFlowChart(this.props.subData)
  }

  componentWillReceiveProps(nextProps) {
    // 递归循环
    if (this.state.subData.modelId !== nextProps.subData.modelId) {
      this.getFlowChart(nextProps.subData)
      this.setState({
        subData: nextProps.subData,
        show: true
      })
    }
  }

  getFlowChart(data) {
    axios({
      url: API.GET_FLOW_CHART,
      method: 'get',
      params: data,
      paramsSerializer: (params) => qs.stringify(params, { indices: false })
    }).then(({ data }) => {
      const newData = _.cloneDeep(data)
      const dataSource = formatFlowChartData(newData)
      const dataSource1 = this.setExecutingStatus(dataSource, data)
      this.setState({ data: dataSource1, visible: true })
    })
  }

  setExecutingStatus = (formatData, originData) => {
    _.map(formatData.nodes, (node) => {
      const item = _.find(originData.flowChartVos, (item) => item.id === node.id)
      if (item) {
        node.style = ProcessStatus['node'][NODE_STATUS[item.passedStatus]]
      }
      node.textStyle = {
        fill: '#FFFFFF'
      }
      if (item.activitiType === 'SubProcess' && item.childModelId) {
        const subData = {
          modelId: item.childModelId
        }
        if (item.passedStatus === 0) {
          subData.isCreate = 1
        } else {
          subData.isCreate = 0
          subData.ticketId = this.props.subData.ticketId
          subData.caseId = item.childCaseId
        }
        node.onClick = () => {
          this.setState({
            showSub: true,
            subData
          })
        }
      }
      node.tooltipVisible = false
    })

    // formatLink
    _.map(formatData.links, (link) => {
      const item = _.find(originData.activityFlowTaskVos, (item) => item.id === link.id)
      if (item && item.highLight) {
        link.style = { fill: '#0DC28E', stroke: '#0DC28E' }
        link.textStyle = {
          fill: '#fff'
        }
      }
      if (item && !item.highLight) {
        link.style = { fill: '#B8BEC8', stroke: '#B8BEC8' }
        link.textStyle = {
          fill: '#fff'
        }
      }
    })

    return formatData
  }

  renderLegend = () => {
    const legends = [
      { text: ProcessStatus.i18n['WAITING'], color: '#B8BEC8' },
      { text: ProcessStatus.i18n['EXECUTING'], color: '#3F81E5' },
      { text: ProcessStatus.i18n['DONE'], color: '#0DC28E' },
      { text: ProcessStatus.i18n['PENDING'], color: '#F49454' },
      { text: ProcessStatus.i18n['ERROR'], color: '#F56780' }
    ]
    return (
      <ul className="chart-legends">
        {_.map(legends, (l, index) => (
          <li key={index}>
            <Tag color={l.color} />
            <span> {l.text} </span>
          </li>
        ))}
      </ul>
    )
  }

  handleFullScreen = () => {
    let url = ''
    const { modelId, ticketId, caseId } = this.props.subData
    if (this.props.subData.isCreate) {
      url = `./process-chart.html#/createTicket/${modelId}?tacheNo=0&modelId=${modelId}&ticketId=${ticketId}&isCreate=1`
    } else {
      url = `./process-chart.html#/ticket/detail/${ticketId}?tacheNo=0&modelId=${modelId}&ticketId=${ticketId}&caseId=${caseId}`
    }
    window.open(url)
  }

  hideModal = () => {
    // this.props.hideModal()
    this.setState({
      show: false,
      subData: {},
      data: {
        nodes: [],
        links: []
      }
    })
  }

  render() {
    const { data } = this.state
    const { width, height } = this.props
    if (data && data.length === 0) {
      return null
    }
    const skin = this.props.skin || document.querySelector('html').className || 'blue'
    const title = (
      <p>
        <span>{i18n('process', '流程图')}</span>
        <span
          className="header-full-icon"
          title={i18n('full_screen', '全屏')}
          onClick={this.handleFullScreen}
        >
          <ArrowsAltOutlined />
        </span>
      </p>
    )
    return this.props.unModal ? (
      <div className="process-chart full-chart" style={{ height: '100%', width: '100%' }}>
        {this.state.visible ? (
          <FlowChart
            links={data.links}
            nodes={data.nodes}
            width={this.props.width}
            height={this.props.height}
            size={this.props.size} // 用来判断第一次进入的时候是否居中渲染
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '20%' }}>
            <Spin />
          </div>
        )}
        {this.renderLegend()}
      </div>
    ) : (
      <div>
        <Modal
          title={title}
          width={782}
          key={skin}
          visible={this.state.show}
          wrapClassName="process-chart"
          onCancel={this.hideModal}
          footer={null}
        >
          {this.state.visible ? (
            <FlowChart
              isNodeDrag={false}
              width={width}
              height={height}
              links={data.links}
              nodes={data.nodes}
              size={this.props.size}
            />
          ) : (
            <div
              style={{
                width: width || 750,
                height: height || 500,
                textAlign: 'center',
                padding: '20%'
              }}
            >
              <Spin />
            </div>
          )}
          {this.renderLegend()}
        </Modal>
        {this.state.showSub && <SubProcessChart subData={this.state.subData} />}
      </div>
    )
  }
}

export default SubProcessChart
