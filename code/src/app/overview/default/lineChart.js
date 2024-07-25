import React, { Component } from 'react'
import { autorun, toJS } from 'mobx'

class LineChart extends Component {
  async componentDidMount() {
    const { default: echarts } = await import(/* webpackChunkName: "echarts" */ '../echarts')
    this.chart = echarts.init(this.content)
    this.disposer = autorun(() => {
      const options = toJS(this.props.store.options)
      !_.isEmpty(options) && this.chart.setOption(options)
    })
    this.chart.on('click', (params) => {
      this.props.onClick(params)
    })
  }

  componentWillUnmount() {
    this.disposer()
  }

  render() {
    return (
      <div
        className="chart-wrap"
        ref={(ref) => {
          this.content = ref
        }}
      />
    )
  }
}

export default LineChart
