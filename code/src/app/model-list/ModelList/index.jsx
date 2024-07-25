import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { QuestionCircleFilled } from '@uyun/icons'
import { Tooltip, Icon } from '@uyun/components'
import FShapeLayout from '~/components/ContentLayout/FShapeLayout'
import Header from './Header'
import Table from './Table'
import GroupList from './GroupList'

@inject('modelListStore')
@observer
class ModelList extends Component {
  static defaultProps = {
    wrapperHeight: '100%'
  }

  componentDidMount() {
    this.handleQuery()
  }

  handleFilterChange = filters => {
    const { query, setValue } = this.props.modelListStore

    setValue({ query: { ...query, ...filters } })
  }

  handleGroupChange = id => {
    this.handleFilterChange({
      layoutId: id === 'all' ? undefined : id,
      pageNo: 1
    })
    this.handleQuery()
  }

  handleQuery = () => {
    this.props.modelListStore.getConfModelList()
  }

  render() {
    const { wrapperHeight } = this.props
    const { query, groupList } = this.props.modelListStore
    const commonProps = {
      onFilterChange: this.handleFilterChange,
      onQuery: this.handleQuery
    }

    const selectedGroup = groupList.find(item => item.id === query.layoutId)
    const selectedGroupName = selectedGroup ? selectedGroup.name : '全部'

    return (
      <FShapeLayout style={{ height: wrapperHeight }}>
        <FShapeLayout.Left
          header={<h3>{i18n('process.model.group', '流程模型分组')}</h3>}
          extra={
            <Tooltip title={i18n('process.model.group.tip')}>
              <QuestionCircleFilled />
            </Tooltip>
          }
        >
          <GroupList onChange={this.handleGroupChange} />
        </FShapeLayout.Left>
        <FShapeLayout.Right header={<h3>{selectedGroupName}</h3>}>
          <Header {...commonProps} />
          <Table {...commonProps} />
        </FShapeLayout.Right>
      </FShapeLayout>
    )
  }
}

export default ModelList
