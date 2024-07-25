import React, { Component } from 'react'
import { autorun, toJS } from 'mobx'
import { Empty } from '@uyun/components'

class PieChart extends Component {
  constructor(props) {
    super(props)
    this.ref = React.createRef()
  }

  async componentDidMount() {
    if (this.ref.current) {
      const { default: echarts } = await import('../echarts')
      this.chart = echarts.init(this.ref.current)
      this.disposer = autorun(() => {
        const options = toJS(this.props.store.options)
        // 由于后端统计数据不准确，总数从边上表格获取
        if (this.props.total) {
          options.title.text = this.props.total || 0
        }
        !_.isEmpty(options) && this.chart.setOption(options)
      })
    }
  }

  componentWillUnmount() {
    this.disposer()
  }

  render() {
    if (this.props.total === 0) {
      return <Empty type="data" />
    }
    return <div ref={this.ref} className="overview-pie-chart" />
  }
}

export default PieChart
