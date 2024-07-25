import React, { Component } from 'react'
import { toJS } from 'mobx'
import PropTypes from 'prop-types'
import { Button, Modal, Tooltip, message } from '@uyun/components'
class Topology extends Component {
  state = {
    url: ''
  }

  static contextTypes = {
    ticketId: PropTypes.string
  }

  get screenRatio() {
    return document.body.clientWidth / document.body.clientHeight
  }

  showCMDBTopology = async (type) => {
    let { getFieldValue, field, sandboxId } = this.props
    const bindResource = toJS(getFieldValue(field.bindField))
    if (_.isEmpty(bindResource)) {
      message.warning(i18n('ticket-field-topology-tip1', '请选择已经关联的配置项'))
      return false
    }
    // 编辑新增的时候，么有沙箱id需要新建，查看的时候没有就没有
    if (_.isEmpty(sandboxId) && type !== 'show') {
      const result = await this.props.resourceStore.createCMDBSanbox(this.context.ticketId)
      this.props.resourceStore.setSandboxID(res.sandboxId)
      if (result && result.sandboxId) {
        sandboxId = result.sandboxId
      } else {
        return false
      }
    }
    const { topologyItem } = this.props
    const chartType = this.props.field.chartType === '0' ? 'schemaDiagram' : 'appDeploy'
    // appid 为配置项id sandboxTaskId为图的taskid
    const appid = bindResource[0].id ? bindResource[0].id : bindResource[0].taskId
    const sandboxTaskId = topologyItem.taskId ? topologyItem.taskId : ''
    let url = ''
    if (type === 'create') {
      url = `/cmdb/config.html#/${chartType}?sandboxId=${sandboxId}&create=true&appId=${appid}`
    } else if (type === 'edit') {
      url = `/cmdb/config.html#/${chartType}?sandboxId=${sandboxId}&appId=${appid}`
      // 实例图的时候每次都要初始化
      if (this.props.field.chartType === '1') {
        url += '&create=true'
      }
    } else {
      // 查看的时候可能没有沙箱id，但是auto那边会创建沙箱，itsm这边不能删掉，auto的作业图的时候需要用沙箱id
      if (_.includes(['3', '4'], topologyItem.chartStatus)) {
        url = `/cmdb/config.html#/${chartType}/detail?appId=${appid}`
      } else {
        url = `/cmdb/config.html#/${chartType}/detail?sandboxId=${sandboxId}&appId=${appid}`
      }
    }
    // 如果图已经生效就没有图的taskid
    if (sandboxTaskId && topologyItem.chartStatus !== '3') {
      url += `&sandboxTaskId=${sandboxTaskId}`
    }
    // 实例图的时候传递发布类型（应用持续交付）
    if (this.props.field.chartType === '1') {
      const publishType = this.props.getFieldValue && this.props.getFieldValue('publishType')
      if (publishType) {
        url += `&publishType=${publishType}`
      }
    }
    this.setState({ url }, () => {
      window.addEventListener('message', this.cmdbPostMessage)
    })
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.cmdbPostMessage)
  }

  cmdbPostMessage = async (mes) => {
    const { url } = this.state
    let chartStatus = '2'
    if (url.indexOf('&create=true') !== -1) {
      chartStatus = '1'
    }
    if (!_.isEmpty(mes.data)) {
      this.setState({ url: '' }, () => {
        window.removeEventListener('message', this.cmdbPostMessage)
      })
      if (mes.data.sucess) {
        const res = await this.props.queryChartSandbox(chartStatus)
        this.props.onChange([_.assign({}, res, { chartStatus })])
      }
    }
  }

  renderChartTypeName = () => {
    switch (this.props.field.chartType) {
      case '0':
        return i18n('chartType-value-0', '部署架构图')
      case '1':
        return i18n('chartType-value-1', '部署实例图')
      case '2':
        return i18n('chartType-value-2', '自由拓扑图')
    }
  }

  render() {
    const { disabled, field } = this.props
    // "chartStatus":"，图的状态    1；新增    2：更新中    3：已生效    4：关联
    const { thumbnail, chartName, chartStatus } = this.props.topologyItem
    const { url } = this.state
    return (
      <div className="ticket-form-field-topology" id={field.code}>
        {!thumbnail && (
          <Button
            disabled={disabled}
            onClick={() => {
              this.showCMDBTopology('create')
            }}
          >
            {i18n('field_value_asset_tip1', '新增')}
          </Button>
        )}
        {thumbnail && (
          <div
            style={{ height: '180px', width: `${this.screenRatio * 180}px` }}
            className="field-topology-item-wrap"
            onClick={() => {
              this.showCMDBTopology('show')
            }}
          >
            <div className="field-topology-item-mongolian-layer">
              <p>{chartName}</p>
              <span className="iconfont-wrap">
                {_.includes(['1', '2', '4'], chartStatus) && !disabled && (
                  <Tooltip title={i18n('edit', '编辑')}>
                    <i
                      className="iconfont icon-bianji"
                      onClick={(e) => {
                        e.stopPropagation()
                        this.showCMDBTopology('edit')
                      }}
                    />
                  </Tooltip>
                )}
              </span>
            </div>
            <div className="field-topology-item-img-wrap">
              <img src={thumbnail} />
            </div>
          </div>
        )}
        <Modal
          maskClosable={false}
          title={Boolean(url) && this.renderChartTypeName()}
          visible={Boolean(url)}
          onCancel={() => {
            this.setState({ url: '' }, () => {
              window.removeEventListener('message', this.cmdbPostMessage)
            })
          }}
          wrapClassName="ticket-topology-iframe-modal"
          footer={null}
        >
          <iframe
            src={url}
            width="100%"
            height="100%"
            allowFullScreen="allowfullscreen"
            scrolling="yes"
            name="topologyIframe"
            frameBorder={0}
          />
        </Modal>
      </div>
    )
  }
}
export default Topology
