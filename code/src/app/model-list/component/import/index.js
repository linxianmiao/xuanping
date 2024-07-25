import React, { Component } from 'react'
import { Button, Dropdown, Menu } from '@uyun/components'
import { observer, inject } from 'mobx-react'
import ImportModal from './importModal'
import { orLowcode } from '~/utils/common'

@inject('globalStore')
@observer
class Import extends Component {
  state = {
    visible: ''
  }

  handleShowImport = (e) => {
    this.setState({ visible: e.key })
  }

  render () {
    const { modelInsert, modelModify } = this.props.globalStore.configAuthor
    const { visible } = this.state
    return (
      <React.Fragment>
        {
          (orLowcode(modelInsert || modelModify)) &&
          <Dropdown overlay={
            <Menu selectedKeys={[visible]} onClick={this.handleShowImport}>
              { orLowcode(modelInsert) && <Menu.Item key="add">{i18n('model-list-import-add-model', '新增模型')}</Menu.Item>}
              { orLowcode(modelModify) && <Menu.Item key="update">{i18n('model-list-import-update-model', '更新模型')}</Menu.Item>}
            </Menu>
          }>
            <Button style={{ margin: '0 10px' }} type="primary">{i18n('modal.import.text', '导入')}</Button>
          </Dropdown>
        }
        <ImportModal
          visible={visible}
          handleShowImport={this.handleShowImport} />
      </React.Fragment>
    )
  }
}
export default Import
