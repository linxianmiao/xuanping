import React, { Component } from 'react'
import ProcessChart from './processChart'
import { qs } from '@uyun/utils'
import './style/processIndex.less'
import './style/process.less'

class ProcessIndex extends Component {
  constructor (props) {
    super(props)
    this.state = {
      flowChart: {}
    }
    const { appkey } = this.parseURLParams()
     window.LOWCODE_APP_KEY = appkey
  }

  componentDidMount () {
    const queryObject = this.parseURLParams()
    const { ticketId, modelId, tacheNo, isCreate, caseId } = queryObject
    if (ticketId && modelId) {
      const data = {
        isCreate: isCreate ? 1 : 0,
        ticketId,
        modelId,
        tacheNo,
        caseId
      }
      axios({
        url: API.GET_FLOW_CHART,
        method: 'get',
        params: data,
        paramsSerializer: params => qs.stringify(params, { indices: false })
      }).then((res) => {
        this.setState({ flowChart: res || {} })
      })
    } else {
      throw new Error('did not pass query params!')
    }
  }

  parseURLParams = () => {
    const [, query] = window.location.href.split('?')
    if (query) {
      const params = query.split('&')
      if (params && params.length > 0) {
        const queryObject = { ticketId: this.props.match.params.id }
        params.map(item => {
          const [key, value] = item.split('=')
          queryObject[key] = value
        })
        return queryObject
      }
    }
    return null
  }

  render () {
    const { flowChart } = this.state
    if (flowChart.mode === undefined) { return null }
    const skin = window.skin
    return (
      <ProcessChart
        unModal
        width={window.innerWidth}
        height={window.innerHeight}
        skin={skin}
        dataSource={flowChart.data}
        visible
      />
    )
  }
}
export default ProcessIndex
