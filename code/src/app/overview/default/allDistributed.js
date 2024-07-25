import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { Radio, Title, Card } from '@uyun/components'
import { observer } from 'mobx-react'
import { autorun } from 'mobx'
import PieChart from './pieChart'
import './style/allDistributed.less'
const RadioGroup = Radio.Group
const RadioButton = Radio.Button

@withRouter
@observer
class AllDistributed extends Component {
  componentDidMount () {
    this.disposer = autorun(() => {
      const data = { type: this.props.store.type }
      this.props.store.getDistributed(data)
    })
  }

    onChange = e => {
      this.props.store.setType(e.target.value)
    }

    componentWillUnmount () {
      this.disposer()
      this.props.store.disposer()
    }

    onClick = params => {
      const type = this.props.store.type
      const router = this.props.history
      const data = params.data
      if (type === '1') {
        data.using && router.push({ pathname: '/ticket/all',
          query: {
            modelId: data.id
          }
        })
      }

      if (type === '2') {
        const query = {}
        if (data.source === 'web') {
          query.source = 'itsm'
        } else if (data.source === 'srvcat') {
          query.source = 'catalog'
        } else if (data.source === 'asset') {
          query.source = 'other'
        } else {
          query.source = data.source
        }
        router.push({ pathname: '/ticket/all', query: query })
      }

      if (type === '3') {
        router.push({ pathname: '/ticket/all',
          query: {
            status: data.status
          }
        })
      }
    }

    render () {
      return (
        <div className="overview-default-public-wrap">
          <Title>{i18n('distributed', '工单分布')}</Title>
          <div className="overview-default-radio-group clearfix">
            <RadioGroup onChange={this.onChange} defaultValue="1">
              <RadioButton value="1">{i18n('tip7', '工单模型') }</RadioButton>
              <RadioButton value="2">{i18n('tip8', '来源') }</RadioButton>
              <RadioButton value="3">{i18n('tip9', '状态') }</RadioButton>
            </RadioGroup>
          </div>
          <Card bodyStyle={{ height: 360 }}>
            <PieChart store={this.props.store} onClick={this.onClick} />
          </Card>
        </div>
      )
    }
}

export default AllDistributed
