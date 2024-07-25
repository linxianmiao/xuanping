import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Button, message } from '@uyun/components'
import DataList from './dataList'
import Filter from './filter'
import styles from './index.module.less'
@observer
export default class DataPermission extends Component {
  handleSave = async () => {
    const { selectedRowKeys, dataTableList, dataTableQuery } = this.props.userRoleStore
    const { roleId } = dataTableQuery || {}
    const { list } = dataTableList
    const ids = _.chain(list)
      .map((item) => item.id)
      .filter((item) => !_.includes(selectedRowKeys, item))
      .value()
    const data = {
      ids, // 当前页所有未被选中的权限数据id集
      permissionIds: selectedRowKeys // 当前页所有选中的权限数据id集
    }
    const res = await this.props.userRoleStore.updateRolePermission(roleId, data)
    if (+res === 200) {
      message.success(i18n('ticket.from.update.sucess', '更新成功'))
    }
  }

  componentDidMount() {
    this.props.handleChangeDataTableQuery({ roleId: this.props.role.roleId })
  }

  render() {
    const { dataTableQuery, categoryCodeList } = this.props.userRoleStore
    const { kw, categoryCode } = dataTableQuery || {}
    return (
      <div className={styles.dataPermission}>
        <Filter
          kw={kw}
          categoryCode={categoryCode}
          categoryCodeList={categoryCodeList}
          handleChangeDataTableQuery={this.props.handleChangeDataTableQuery}
        >
          <Button type="primary" onClick={this.handleSave}>
            {i18n('globe.save', '保存')}
          </Button>
        </Filter>
        <div className={styles.dataList}>
          <DataList
            handleChangeDataTableQuery={this.props.handleChangeDataTableQuery}
            userRoleStore={this.props.userRoleStore}
          />
        </div>
      </div>
    )
  }
}
