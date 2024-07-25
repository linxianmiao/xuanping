import React, { Component, lazy, Suspense } from 'react'
import { ArrowsAltOutlined } from '@uyun/icons'
import { Modal, Tag, Spin, message } from '@uyun/components'
import { formatFlowChartData, ProcessStatus, NODE_STATUS } from './util.js'
import SubProcessChart from './subProcessChart'
import JobDetail from './job/jobDetail'

const FlowChart = lazy(() => import(/* webpackChunkName: "flowChart" */ './flowChart'))
class ProcessChart extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: {
        nodes: [],
        links: []
      },
      drawerVisible: false,
      autoUrl: undefined
    }
  }

  componentDidMount() {
    let data = formatFlowChartData(this.props.dataSource)
    data = this.setExecutingStatus(data)
    this.setState({ data })
  }

  setExecutingStatus = (formatData) => {
    const originData = this.props.dataSource
    // formatNode
    _.map(formatData.nodes, (node) => {
      const item = _.find(originData.flowChartVos, (item) => item.id === node.id)
      if (item) {
        node.style = ProcessStatus.node[NODE_STATUS[item.passedStatus]]
      }
      node.textStyle = {
        fill: '#FFFFFF'
      }
      if ((item.activitiType === 'SubProcess' && item.childModelId) || item.a) {
        const subData = {
          modelId: item.childModelId
        }
        if (item.passedStatus === 0) {
          subData.isCreate = 1
          subData.ticketId = this.props.ticketId
        } else {
          subData.isCreate = 0
          subData.ticketId = this.props.ticketId
          subData.caseId = item.childCaseId
        }
        node.onClick = () => {
          this.setState({
            show: true,
            subData
          })
        }
      }
      if (item.activitiType === 'AutoTask' && item.autoUrl) {
        node.onClick = () => {
          // Drawer 监听onclick 挂在document  ， node 挂在window上， window的触发在document前
          const str = item.autoUrl
          const reg = /(?:workflow|operation)\/([\w]{32})/
          const list = str.match(reg)
          const jobId = list ? list[1] : ''

          // item.autoUrl.split('/').pop()
          // 表单中判断自动节点是否可以侧滑打开automation页面
          axios.get(API.isExistJob, { params: { jobId } }).then((res) => {
            if (_.get(res, 'isExist')) {
              this.setState({
                drawerVisible: true,
                autoUrl: item.autoUrl
              })
            } else {
              message.info(_.get(res, 'message'))
            }
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
      { text: ProcessStatus.i18n.WAITING, color: '#B8BEC8' },
      { text: ProcessStatus.i18n.EXECUTING, color: '#3F81E5' },
      { text: ProcessStatus.i18n.DONE, color: '#0DC28E' },
      { text: ProcessStatus.i18n.PENDING, color: '#F49454' },
      { text: ProcessStatus.i18n.ERROR, color: '#F56780' }
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
    if (this.props.onFullClick && typeof this.props.onFullClick === 'function') {
      return this.props.onFullClick()
    }
    let url = ''
    const { tacheNo, tacheType, modelId, ticketId, caseId } = this.props
    if (this.props.isCreate) {
      url = `./process-chart.html#/createTicket/${modelId}?tacheNo=${tacheNo}&modelId=${modelId}&ticketId=${ticketId}&tacheType=${tacheType}&isCreate=true`
    } else {
      url = `./process-chart.html#/ticket/detail/${ticketId}?tacheNo=${tacheNo}&caseId=${caseId}&modelId=${modelId}&ticketId=${ticketId}&tacheType=${tacheType}`
    }
    if (window.LOWCODE_APP_KEY) {
      url = `${url}&appkey=${window.LOWCODE_APP_KEY}`
    }
    window.open(url)
  }

  componentDidUpdate(prevProps) {
    if (this.props.visible && !this.state.visible) {
      setTimeout(() => {
        this.setState({
          visible: true
        })
      }, 100)
    }
  }

  hideModal = () => {
    this.setState({
      show: false
    })
  }

  render() {
    const { data, drawerVisible, autoUrl } = this.state
    const { width, height, detailForms, autoJobInfo } = this.props
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
    return (
      <Suspense fallback={() => null}>
        {this.props.unModal ? (
          <div className="process-chart full-chart" style={{ height: '100%', width: '100%' }}>
            {this.state.visible ? (
              <FlowChart
                links={data.links}
                nodes={data.nodes}
                width={this.props.width}
                height={this.props.height}
                size={this.props.size}
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
              size="large"
              key={skin}
              wrapClassName="process-chart"
              visible={this.props.visible}
              onCancel={this.props.hideModal}
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
            {this.state.show && <SubProcessChart subData={this.state.subData} />}
          </div>
        )}
        <JobDetail
          visible={drawerVisible}
          info={{ ...autoJobInfo, jobDetailUrl: autoUrl }}
          onClose={() => this.setState({ drawerVisible: false, autoUrl: undefined })}
          detailForms={detailForms}
          getDetailForms={this.props.getDetailForms}
        />
      </Suspense>
    )
  }
}

export default ProcessChart
