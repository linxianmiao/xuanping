import React, { Component } from 'react'
import { Tabs } from '@uyun/components'
import LazySelect from '~/components/lazyLoad/lazySelect'
import styles from './index.module.less'
const TabPane = Tabs.TabPane

export default class Tab extends Component {
  state = {
    activeKey: 'fieldparamlist'
  }

  handleChangeActiveKey = (activeKey) => {
    this.setState({ activeKey })
  }

  getList = (query, callback, paramType) => {
    const { activeKey } = this.state
    if (activeKey === 'builtinParams' || activeKey === 'defineParams' || activeKey === 'modelParams') {
      const { pageSize, pageNo, kw } = query
      const params = { wd: kw, pageSize, pageNo, scope: 1 } // scope=1表示builtinParams
      if (activeKey === 'defineParams') {
        params.scope = 2
      }
      if (activeKey === 'modelParams') {
        params.scope = 4
        params.modelId = this.props.modelId
      }

      axios.get(API.listFieldWithPage, { params }).then(data => {
        const list = _.forEach(data.list, item => { item.id = item.code })
        callback(list)
      })
    } else {
      const list = _.forEach(paramType.list, item => { item.id = item.code })
      callback(list)
    }
  }

  render () {
    const { activeKey } = this.state
    const { getPopupContainer } = this.props
    return (
      <div className={styles.tacheList}>
        <Tabs type="card" activeKey={activeKey} onChange={this.handleChangeActiveKey}>
          {
            _.map(this.props.paramsType, paramType => {
              return <TabPane key={paramType.code} tab={paramType.name}>
                <LazySelect
                  showTip
                  getPopupContainer={getPopupContainer}
                  labelInValue={false}
                  filterWithoutQuery={activeKey === 'fieldparamlist'}
                  onChange={value => this.props.onChangeParam(value, activeKey)}
                  getList={(query, callback) => { this.getList(query, callback, paramType) }}
                  placeholder={i18n('globe.select', '请选择')} />
              </TabPane>
            })
          }
        </Tabs>
      </div>
    )
  }
}
