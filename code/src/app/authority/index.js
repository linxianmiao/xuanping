import React from 'react'
import UserRole from '@uyun/ec-user-role'
import { inject, observer, Provider } from 'mobx-react'
import DataPermission from './dataPermission'
import PageHeader from '~/components/pageHeader'
import ErrorBoundary from '~/components/ErrorBoundary'
import { autorun } from 'mobx'
import userRoleStore from './userRoleStore'

@observer
export default class Authority extends React.Component {
  componentDidMount() {
    const { categoryCodeList } = userRoleStore
    if (_.isEmpty(categoryCodeList)) {
      userRoleStore.getListCategories()
    }
    this.disposer = autorun(
      () => {
        const { dataTableQuery } = userRoleStore
        if (dataTableQuery.roleId) {
          userRoleStore.getDataTableList(dataTableQuery)
        }
      },
      { delay: 300 }
    )
  }

  componentWillUnmount() {
    this.disposer()
  }

  handleSelectRole = (roleId, item) => {
    this.handleChangeDataTableQuery({ roleId })
  }

  handleChangeDataTableQuery = (data) => {
    const { dataTableQuery } = userRoleStore
    const query = _.assign({}, dataTableQuery, data)
    userRoleStore.setData({ dataTableQuery: query })
  }

  render() {
    return (
      <Provider userRoleStore={userRoleStore}>
        <React.Fragment>
          <PageHeader />
          <ErrorBoundary>
            <div className="content-layout" style={{ height: 'calc(100% - 60px)' }}>
              <UserRole productName="ITSM" onSelectRole={this.handleSelectRole}>
                <DataPermission
                  handleChangeDataTableQuery={this.handleChangeDataTableQuery}
                  userRoleStore={userRoleStore}
                />
              </UserRole>
            </div>
          </ErrorBoundary>
        </React.Fragment>
      </Provider>
    )
  }
}
