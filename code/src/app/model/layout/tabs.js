import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { observer, inject } from 'mobx-react'
import PropTypes from 'prop-types'
import { Header, TabPane } from './index'

import leaveNotifyModal from '~/components/leaveNotifyModal'
import getURLParam from '~/utils/getUrl'

import './style/tabs.less'

import { Providers } from '@uyun/everest-injectable'
import FlowStore from '../store/flowStore'

const FlowModule = Providers.create([FlowStore])

@inject('formSetGridStore', 'modelFieldListStore', 'flowListStore', 'leaveStore')
@withRouter
@observer
class Tabs extends Component {
  constructor(props) {
    super(props)

    const { visibleKey } = props.location.state || {}
    this.state = {
      visibleKey: visibleKey || '1'
    }
  }

  static contextTypes = {
    modelId: PropTypes.string
  }

  componentDidMount() {
    if (getURLParam('source') === 'field') {
      this.setState({ visibleKey: '5' })
    }
  }

  componentWillUnmount() {
    // 清空字段设置列表、表单列表、流程设计列表的筛选条件
    this.props.modelFieldListStore.resetQuery()
    this.props.formSetGridStore.setData(undefined, 'formListKw')
    this.props.flowListStore.reset()
  }

  changeVisbleKey = async (visibleKey) => {
    const { leaveStore } = this.props
    if (visibleKey !== '1' && leaveStore.basicInfoSave) {
      leaveNotifyModal('', () => {
        this.setState({ visibleKey }, () => {
          leaveStore.setBasicInfoSave(0)
        })
      })
      return false
    }
    if (visibleKey === this.state.visibleKey) {
      return
    }
    // Cannot have two HTML5 backends at the same time
    // react-dnd 和流程图 只能崔在一个，所以必须先卸载react-dnd才能触发流程图
    if (visibleKey === '3') {
      this.setState({ visibleKey: '' })
    }
    setTimeout(() => {
      this.setState({
        visibleKey
      })
    })
  }

  render() {
    const { visibleKey } = this.state
    return (
      <FlowModule>
        <div className="model-tabs">
          <Header visibleKey={visibleKey} changeVisbleKey={this.changeVisbleKey} />
          <TabPane visibleKey={visibleKey} changeVisbleKey={this.changeVisbleKey} />
        </div>
      </FlowModule>
    )
  }
}

export default Tabs
