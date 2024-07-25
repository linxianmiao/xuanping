import React, { Component } from 'react'
import { Provider } from 'mobx-react'
import { MemoryRouter } from 'react-router-dom'
import '~/common/common'
import 'moment/locale/zh-cn'
import dataBaseStore from '../../app/stores/dataBaseStore'
import tableListStore from '../../app/stores/tableListStore'
import globalStore from '../../app/stores/globalStore'
import modelListStore from '../../app/stores/modelListStore'
import userPickStore from '../../app/stores/userPickStore'
import './index.less'
import TabList from './tabs'

class DataTable extends Component {
  render() {
    const { dataCodes } = this.props
    return (
      <div className="itsm-data-list">
        <Provider
          dataBaseStore={dataBaseStore}
          globalStore={globalStore}
          userPickStore={userPickStore}
          tableListStore={tableListStore}
          modelListStore={modelListStore}
        >
          <MemoryRouter>
            <TabList {...this.props} dataBaseStore={dataBaseStore} dataCodes={dataCodes} />
          </MemoryRouter>
        </Provider>
      </div>
    )
  }
}

export default DataTable
