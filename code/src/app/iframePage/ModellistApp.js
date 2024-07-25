import React, { Component } from 'react'
import { Radio } from '@uyun/components'
import Modellist from '~/model-list'
import Queryer from '~/system/queryer'
import Dictionary from '~/system/dictionary'
import FieldList from '~/field-list'
import TriggerList from '~/trigger-list'
import './ModellistApp.less'
import DataBaseTable from '~/dataBaseTable'
import getURLParam from '../utils/getUrl'

class ModellistApp extends Component {
  state = {
    activeTab: 'model'
  }

  componentDidMount() {
    const activeTab = getURLParam('activeTab') || 'model'
    this.setState({ activeTab })
  }

  componentWillUnmount() {
    window.LOWCODE_APP_KEY = ''
  }

  link = (e) => {
    const value = e.target.value
    // if (value === 'trigger') {
    //   window.location.href = `#/triggerlist/${this.props.match.params.appkey}`
    // } else {
    //   this.setState({ activeTab: value })
    // }
    this.setState({ activeTab: value })
  }

  render() {
    const { activeTab } = this.state
    return (
      <div className="model-list-app-wrap">
        <div>
          <Radio.Group value={activeTab} onChange={this.link}>
            <Radio.Button value="model">模型管理</Radio.Button>
            <Radio.Button value="fieldlist">字段管理</Radio.Button>
            <Radio.Button value="trigger">触发器</Radio.Button>
            <Radio.Button value="queryer">查询器</Radio.Button>
            <Radio.Button value="dictionary">字典管理</Radio.Button>
            <Radio.Button value="datatable">数据表管理</Radio.Button>
          </Radio.Group>
        </div>
        {activeTab === 'trigger' ? <TriggerList appkey={this.props.match.params.appkey} /> : null}
        {activeTab === 'model' ? <Modellist appkey={this.props.match.params.appkey} /> : null}
        {activeTab === 'queryer' ? (
          <Queryer appkey={this.props.match.params.appkey} appIsolation />
        ) : null}
        {activeTab === 'dictionary' ? (
          <Dictionary appkey={this.props.match.params.appkey} appIsolation />
        ) : null}
        {activeTab === 'fieldlist' ? <FieldList appkey={this.props.match.params.appkey} /> : null}
        {activeTab === 'datatable' ? (
          <DataBaseTable appkey={this.props.match.params.appkey} />
        ) : null}
      </div>
    )
  }
}

export default ModellistApp
