import React, { Component, lazy, Suspense } from 'react'
import { inject, observer } from 'mobx-react'
import FlowList from './List'
import { Skeleton } from '@uyun/components'

const FlowChart = lazy(() => import(/* webpackChunkName: "flowEditor" */ '../../component/flow'))

@inject('flowListStore')
@observer
export default class Flow extends Component {
  componentWillUnmount() {
    this.props.flowListStore.getChartInfo()
  }

  render() {
    const { modelId, res, changeVisbleKey } = this.props
    const { chartId } = this.props.flowListStore

    return (
      <Suspense fallback={() => <Skeleton />}>
        {chartId ? (
          <FlowChart res={res} changeVisbleKey={changeVisbleKey} />
        ) : (
          <FlowList modelId={modelId} />
        )}
      </Suspense>
    )
  }
}
