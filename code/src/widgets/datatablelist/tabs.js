import React, { Component } from 'react'
import { Tabs, Empty } from '@uyun/components'
import InitializedTable from '~/dataBaseTable/initializedTable'
import _ from 'lodash'

class DataBaseLit extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dataList: []
    }
  }

  componentDidMount() {
    window.LOWCODE_APP_KEY = this.props.appKey || this.props.appkey
    this.getList()
  }

  componentWillUnmount() {
    window.LOWCODE_APP_KEY = ''
  }

  getList = async () => {
    const { dataCodes } = this.props
    const res = await this.props.dataBaseStore.queryDataSetList({ pageNo: 1, pageSize: 999 })
    let data = _.map(res.list, (item) => {
      return {
        name: item.dataSetName,
        value: item.dataSetId,
        key: item.dataSetCode
      }
    })

    if (!_.isEmpty(dataCodes)) {
      data = _.filter(data, (item) => _.includes(dataCodes, item.key))
    }

    this.setState({ dataList: data || [] })
  }
  componentDidUpdate(prevProps) {}
  render() {
    const { dataList } = this.state
    const content = _.map(dataList, (item) => {
      return {
        label: item.name,
        key: item.value,
        children: <InitializedTable {...this.props} source="npm" dataSetId={item.value} />
      }
    })

    return (
      <div>
        {_.isEmpty(dataList) ? (
          <Empty type="table" />
        ) : Array.isArray(dataList) && dataList.length === 1 ? (
          _.map(dataList, (item) => {
            return <InitializedTable {...this.props} source="npm" dataSetId={item.value} />
          })
        ) : (
          <Tabs
            style={{
              height: 220
            }}
            items={content}
            destroyInactiveTabPane
          />
        )}
      </div>
    )
  }
}
export default DataBaseLit
