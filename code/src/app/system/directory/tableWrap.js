import React from 'react'
import TreeList from './treeList'
import { Button } from '@uyun/components'
import { PlusOutlined } from '@uyun/icons';
import SearchInput from './searchInput'
import SearchTable from './searchTable'
import { inject, observer } from 'mobx-react'

@inject('directoryStore')
@observer
class TableWrap extends React.Component {
  render() {
    const { kw } = this.props.directoryStore
    return (
      <div className="org_right_content">
        <SearchInput placeholder={i18n('globe.keywords', '请输入关键字')} style={{ width: 200 }} />
        <div className="button_content">
          <Button type="primary"  icon={<PlusOutlined />}  onClick={this.props.createType}> {i18n('system.queryer.addType', '添加分类')}</Button>
          <Button type="primary"  icon={<PlusOutlined />}  onClick={this.props.changeVisible}>{i18n('create_directory', '添加目录')}</Button>
        </div>
        {
          kw
            ? <SearchTable {...this.props} />
            : <TreeList {...this.props} />
        }
      </div>
    )
  }
}
export default TableWrap
