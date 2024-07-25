import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { inject, observer } from 'mobx-react'
import PageHeader from '~/components/pageHeader'
import ContentLayout from '~/components/ContentLayout'
import ErrorBoundary from '~/components/ErrorBoundary'
import DataBaseTable from './DataBaseTable'
import './style/index.less'

@inject('dataBaseStore')
@withRouter
@observer
class DataBase extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    const { appkey } = this.props
    return (
      <div className="databaseWrapper">
        <PageHeader appkey={appkey} source="datatable" />
        <ContentLayout>
          <ErrorBoundary desc={i18n('loadFail', '加载失败')}>
            <DataBaseTable {...this.props} />
          </ErrorBoundary>
        </ContentLayout>
      </div>
    )
  }
}

export default DataBase
