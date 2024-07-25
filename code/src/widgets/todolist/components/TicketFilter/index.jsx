import React, { Component } from 'react'
import { inject } from '@uyun/core'
import { PlusOutlined } from '@uyun/icons';
import { Button } from '@uyun/components'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'
import cls from 'classnames'
import FilterList from './FilterList'
import styles from './TicketFilter.module.less'
import CreateViewModal from './CreateViewModal'
import { originalQuery, defaultFilterList } from '../../listConfig'
import FilterFields from '../../common/FilterFields'
import AttrFieldPanelModal from '~/components/AttrFieldPanel'

@observer
export default class TicketFilter extends Component {
  @inject('i18n') i18n

  @inject('listStore') listStore

  constructor(props) {
    super(props)
    this.filters = React.createRef()
  }

  componentDidMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(this)
  }

  handleFilter = () => {
    const values = this.filters.current.props.form.getFieldsValue()
    const { query, pageSize } = this.listStore
    this.listStore.setQuery({ ...query, ...values })
    this.listStore.setCurrentAndPageSize(1, pageSize)
    this.listStore.getList()
  }

  handleReset = () => {
    this.listStore.setQuery(originalQuery)
    this.filters.current.props.form.resetFields()
  }

  handleSave = payload => {
    this.filters.current.props.form.validateFields((error, values) => {
      if (error) return
      this.listStore.saveView(values, payload)
    })
  }

  handleFilterChange = ({ value, checked }) => {
    const { checkFilterList } = this.listStore
    let newList
    if (checked) {
      newList = [...checkFilterList, value]
    } else {
      newList = checkFilterList.filter(code => code !== value)
    }
    this.listStore.setProps({ checkFilterList: newList })
  }

  handleChangeAttrField = value => {
    const valueCode = value.map(item => item.code)
    if (valueCode.length === 0) {
      message.info('筛选项至少保留一项')
      return
    }
    this.listStore.setSelectedList(value, 'QUERY')
    this.listStore.setProps({ checkFilterList: valueCode })
  }

  handleBtnClick = () => {
    this.listStore.getAllColumns()
  }

  render() {
    const { visible, viewId, viewName } = this.props
    const { checkFilterList, allField: { builtinFields, extendedFields }, cusColLoading, querySelectedList } = this.listStore
    return (
      <div className={cls(styles.ticketFilterWrap, { [styles.visible]: visible })}>
        <FilterList wrappedComponentRef={this.filters} />
        <div className={styles.filterBtn}>
          {/* <FilterFields
            sortable={false}
            checkedColumnCodes={checkFilterList}
            onChange={this.handleFilterChange}
            fixedFields={defaultFilterList}
            builtinFields={builtinFields}
            extendedFields={extendedFields}
            loading={cusColLoading}
          >
            <Button
              style={{ width: 156 }}
              icon="plus"
              className={styles.leftBtn}
              size="small"
              onClick={this.handleBtnClick}
            >
              {i18n('add.filter', '添加筛选项')}
            </Button>
          </FilterFields> */}
          <AttrFieldPanelModal
            title= {i18n('add.filter', '添加筛选项')}
            attrList={defaultFilterList}
            selected={[...toJS(querySelectedList)]}
            onChange={value => this.handleChangeAttrField(value)}
            sortable={false}
          >
            <Button
                style={{ width: 156 }}
                icon={<PlusOutlined />}
                className={styles.leftBtn}
                size="small"
              >
                {i18n('add.filter', '添加筛选项')}
              </Button>
          </AttrFieldPanelModal>
          <div className={styles.rightWrapper}>
            <Button size="small" type="primary" onClick={this.handleFilter}>{this.i18n('globe.search', '查询')}</Button>
            <CreateViewModal onOk={this.handleSave} viewId={viewId} viewName={viewName} />
            <Button size="small" onClick={this.handleReset}>{this.i18n('globe.reset', '重置')}</Button>
          </div>

        </div>
      </div>
    );
  }
}
