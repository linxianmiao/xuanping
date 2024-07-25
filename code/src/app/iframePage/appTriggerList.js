import React, { Component } from 'react'
import { Radio } from '@uyun/components'
import Apptriggermanage from '@uyun/biz-itsm-apptriggermanage'
import Queryer from '~/system/queryer'
import Dictionary from '~/system/dictionary'
import FieldList from '~/field-list'
import './ModellistApp.less'
import DataBaseTable from '~/dataBaseTable'
class ModellistApp extends Component {
  state = {
    activeTab: 'trigger'
  }

  componentDidMount() {
    window.APPKEY = this.props.match.params.appkey
  }

  componentWillUnmount() {
    window.LOWCODE_APP_KEY = ''
  }

  link = (e) => {
    const value = e.target.value
    if (value === 'model') {
      window.location.href = `#/modellist/${this.props.match.params.appkey}`
    } else {
      this.setState({ activeTab: value })
    }
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
        {activeTab === 'trigger' ? (
          <Apptriggermanage appKey={this.props.match.params.appkey} />
        ) : null}
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
