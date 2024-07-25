import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { toJS } from 'mobx'
import { PlusOutlined } from '@uyun/icons'
import { Button, Modal, Input, Form, message, Row, Col } from '@uyun/components'
import removeFilter from '../config/removeFilter'
import originalQuery from '../config/originalQuery'
import FilterList from '../filterList'
import { defaultFilter, disabledFilter } from '../config/filter'
import FilterFields from './FilterFields'
// import list from '../config/defaultList'
import AttrFieldPanelModal from '~/components/AttrFieldPanel'
import { detailTime } from '../utils'
import '../styles/ticketFilter.less'
const FormItem = Form.Item
@inject('listStore', 'globalStore')
@observer
class TicketFilter extends Component {
  filterList = React.createRef()
  state = {
    visible: false,
    name: undefined
  }

  // get list() {
  //   const { filterType, modelList, modelAndTacheIdList, typeList } = this.props.listStore
  //   const { priorityList } = this.props.globalStore

  //   if (!_.includes(typeList, filterType)) {
  //     return [
  //       {
  //         name: i18n('ticket.list.ticketName', '标题'),
  //         code: 'ticketName',
  //         type: 'singleRowText'
  //       },
  //       {
  //         name: i18n('ticket.list.ticketNum', '单号'),
  //         code: 'ticketNum',
  //         type: 'singleRowText'
  //       },
  //       {
  //         name: i18n('ticket.list.filter.model', '模型'),
  //         code: 'modelId',
  //         type: 'select',
  //         params: _.map(modelList.slice(1), item => ({
  //           label: item.processName,
  //           value: item.processId
  //         }))
  //       },
  //       {
  //         name: i18n('ticket.list.tacheName', '当前阶段'),
  //         code: 'modelAndTacheId',
  //         type: 'treeSel',
  //         treeVos: modelAndTacheIdList
  //       },
  //       {
  //         name: i18n('ticket-list-table-th-priority', '优先级'),
  //         code: 'priority',
  //         type: 'select',
  //         params: _.map(priorityList, item => ({ value: item.value, label: item.name }))
  //       },
  //       {
  //         name: i18n('ticket-list-table-th-executionGroup', '处理组'),
  //         code: 'executionGroup',
  //         type: 'group'
  //       },
  //       {
  //         name: i18n('ticket.list.filter.filterOrg', '创建人所在部门'),
  //         code: 'filterOrg',
  //         type: 'department'
  //       },
  //       {
  //         name: i18n('participant.deparment', '参与人所在部门'),
  //         code: 'filterMyDepart',
  //         type: 'department'
  //       },
  //       ...list
  //     ]
  //   }
  //   return list
  // }

  // 查找
  handleSerach = () => {
    const { query, pageSize, filterType } = this.props.listStore
    const data = this.filterList.current.getFieldsValue()

    if (_.includes(['myToDo', 'groupTodo', 'todoGroup'], filterType) && _.isEmpty(data.status)) {
      data.status = ['1', '2', '10']
    }
    // 全局开关打开时，所有工单筛选中，申请部门必填
    if (window.ticket_department_switch && filterType === 'all') {
      if (!data.applicationSector || data.applicationSector.length === 0) {
        message.error(`${i18n('globe.select', '请选择')}申请部门`)
        return
      }
    }

    this.props.listStore.setQuery(_.assign({}, query, data))
    this.props.listStore.setCurrentAndPageSize(1, pageSize)
    this.props.listStore.getList()
  }

  handleSave = () => {
    this.setState({ visible: true })
  }

  handleReset = () => {
    const query = _.cloneDeep(originalQuery)
    const { querySelectedList, filterType } = this.props.listStore
    if (filterType === 'groupTodo') {
      query.executionGroup = ['currentGroup']
    } else if (filterType === 'myToDo') {
      query.executor = ['currentUser']
    } else if (filterType === 'todoGroup') {
      query.executionGroup = ['currentGroup']
      query.executor = ['currentUser']
    }
    const querySelected = _.cloneDeep(toJS(querySelectedList))
    const {
      menuList: { ticketMenuList = [] }
    } = this.props.globalStore
    const currentMenuData =
      _.find(ticketMenuList, (menu) =>
        menu.code === 'mytodo' ? filterType === 'myToDo' : menu.code === filterType
      ) || {}
    const queryMenuView = currentMenuData.queryMenuView || {}
    _.forEach(querySelected, (item) => {
      const disabled = (queryMenuView.lockCondition || []).indexOf(item.code) > -1
      if (disabled) {
        query[item.code] = item.value
      } else {
        if (!item.hide) {
          item.value = undefined
          query[item.code] = undefined
        }
      }
    })
    this.props.listStore.setSelectedList(querySelected, 'QUERY')
    this.props.listStore.setQuery(query)
    this.filterList.current.resetFields()
    const dateFields =
      _.filter(querySelectedList, (d) => d.type === 'dateTime').map((d) => d.code) || []
    _.forEach(dateFields, (d) => {
      this.filterList.current.setFieldsValue({ [d]: undefined })
    })
  }

  handleChange = ({ value, checked }) => {
    const { checkFilterList } = this.props.listStore
    if (checked) {
      this.props.listStore.setCheckFilterList([...checkFilterList, value])
    } else {
      this.props.listStore.setCheckFilterList(_.filter(checkFilterList, (item) => item !== value))
    }
  }

  handleChangeAttrField = (value) => {
    const { query } = this.props.listStore
    const valueCode = value.map((item) => item.code)
    if (valueCode.length === 0) {
      message.info(i18n('queryer.filter.info', '筛选项至少保留一项'))
      return
    }
    const newQuery = _.cloneDeep(toJS(query))
    _.forIn(newQuery, (value, key) => {
      //排序规则不变，还是按之前的排序规则排序
      if (valueCode.indexOf(key) === -1 && key !== 'orderBy' && key !== 'sortRule') {
        newQuery[key] = undefined
      }
    })

    this.props.listStore.setQuery(newQuery)
    this.props.listStore.setSelectedList(value, 'QUERY')
    this.props.listStore.setCheckFilterList(valueCode)
  }

  handleCancel = () => {
    this.setState({ visible: false })
  }

  // 保存视图
  saveQueryView = (viewId, name) => {
    const { attributeList, allField, columnSelectedList, querySelectedList, filterType } =
      this.props.listStore
    const data = this.filterList.current.getFieldsValue()
    const query = detailTime(data, allField)
    const filter = _.pick(query, defaultFilter)
    const querySelected = _.cloneDeep(toJS(querySelectedList))
    _.forEach(querySelected, (item) => {
      const value = data[item.modelId ? `${item.modelId}_${item.code}` : item.code]
      item.value = value
      if (_.isString(value) && !value) {
        item.value = undefined
      }
      if (_.isArray(value) && value.length === 0) {
        item.value = undefined
      }
      if (_.isPlainObject(value) && _.isEmpty(value)) {
        item.value = undefined
      }
    })
    filter.name = name
    filter.viewId = viewId
    filter.extParams = _.assign({}, { columns: attributeList }, _.omit(query, removeFilter), {
      querySelectedList: querySelected,
      columnSelectedList: toJS(columnSelectedList)
    })
    filter.viewCode = filterType === 'all' ? 'all_ticket' : filterType
    this.props.listStore.saveQueryView(filter)
    this.setState({ visible: false })
  }

  _renderFooter = () => {
    return (
      <div className="ticket-list-view-edit-modal">
        <h3>{i18n('ticket.list.view.name.tip3', '您确定要覆盖当前查询视图吗？')}</h3>
        <div className="btns-wrap">
          <Button
            onClick={() => {
              const { viewId, viewName } = this.props
              this.saveQueryView(viewId, viewName)
            }}
            type="primary"
          >
            {i18n('cover', '覆盖')}
          </Button>
          <Button
            onClick={() => {
              this.props.handleChangeViewId(undefined, undefined)
            }}
            type="primary"
          >
            {i18n('new', '新建')}
          </Button>
          <Button onClick={this.handleCancel} type="primary" ghost>
            {i18n('cancel', '取消')}
          </Button>
        </div>
      </div>
    )
  }

  render() {
    const { filterType, typeList } = this.props.listStore
    const { viewId } = this.props
    const { visible, name } = this.state
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14 }
      }
    }
    let modalDliver
    // 根据有没有视图来判断弹出不同的框
    if (viewId) {
      modalDliver = {
        visible,
        footer: null
      }
    } else {
      modalDliver = {
        visible,
        title: i18n('ticket.list.new.view1', '新建查询视图'),
        onOk: () => {
          const { name } = this.state
          if (!name) {
            message.error(i18n('ticket.list.view.name.tip3', '查询视图名称不能为空'))
            return false
          }
          this.saveQueryView(undefined, name)
        },
        onCancel: () => {
          this.handleCancel()
        }
      }
    }
    const { saveQueryView } = this.props.globalStore.ticketListOperation
    const { allField, checkFilterList, cusColLoading, queryAttrList, querySelectedList } =
      this.props.listStore
    const { builtinFields, extendedFields } = allField
    const newExtendedFields = _.map(extendedFields, (field) =>
      _.assign({}, field, { disabled: disabledFilter.indexOf(field.type) > -1 })
    )

    const {
      menuList: { ticketMenuList = [] }
    } = this.props.globalStore
    const currentMenuData =
      _.find(ticketMenuList, (menu) =>
        menu.code === 'mytodo' ? filterType === 'myToDo' : menu.code === filterType
      ) || {}
    const queryMenuView = currentMenuData.queryMenuView || {}
    const forbiddenFields = _.map(queryMenuView?.querySelectedList, (d) => d.code) || []
    return (
      <div className="filter-list">
        <FilterList ref={this.filterList} periodList={this.props.periodList} />
        <Row className="filter-btns-wrap clearfix more-select-btn">
          <Col span={2} />
          <Col span={22}>
            {!_.includes(typeList, filterType) && (
              // <FilterFields
              //   sortable={false}
              //   checkedColumnCodes={checkFilterList}
              //   onChange={this.handleChange}
              //   fixedFields={this.list}
              //   builtinFields={builtinFields}
              //   extendedFields={newExtendedFields}
              //   loading={cusColLoading}
              //   getPopupContainer={() => document.querySelector('#ticket-list-filter-warp')}
              // >
              //   <Button
              //     icon="plus"
              //     size="small"
              //     className="left-btn"
              //     style={{ width: 106, marginLeft: '-5px' }}
              //   >
              //     {i18n('add.filter', '添加筛选项')}
              //   </Button>
              // </FilterFields>
              <AttrFieldPanelModal
                title={i18n('add.filter', '添加筛选项')}
                attrList={toJS(queryAttrList)}
                selected={[...toJS(querySelectedList)]}
                onChange={(value) => this.handleChangeAttrField(value)}
                modelIds={this.props.ticketViewModelId}
                sortable={false}
                lockCondition={queryMenuView?.lockCondition || []}
                forbiddenFields={forbiddenFields}
              >
                <Button
                  icon={<PlusOutlined />}
                  size="small"
                  className="left-btn"
                  style={{
                    width: 106,
                    marginLeft: '-5px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  {i18n('add.filter', '添加筛选项')}
                </Button>
              </AttrFieldPanelModal>
            )}
            <div className="right-btn">
              <Button
                size="small"
                style={{ marginRight: 10, width: 60 }}
                type="primary"
                onClick={this.handleSerach}
              >
                {i18n('globe.search', '查询')}
              </Button>
              {/* _.includes(['all', 'archived'], filterType) &&  */}
              {saveQueryView && (
                <Button
                  size="small"
                  style={{ marginRight: 10, width: 60 }}
                  type="primary"
                  onClick={this.handleSave}
                >
                  {i18n('globe.save', '保存')}
                </Button>
              )}
              <Button size="small" style={{ width: 60 }} onClick={this.handleReset}>
                {i18n('globe.reset', '重置')}
              </Button>
            </div>
          </Col>
        </Row>
        <Modal {...modalDliver}>
          {viewId ? (
            this._renderFooter()
          ) : (
            <FormItem
              {...formItemLayout}
              required
              label={i18n('ticket.list.view.name1', '查询视图名称')}
            >
              <Input
                maxLength="10"
                value={name}
                placeholder={i18n('ticket.list.view.name.tip4', '请输入查询视图名称')}
                onChange={(e) => {
                  this.setState({ name: e.target.value })
                }}
              />
            </FormItem>
          )}
        </Modal>
      </div>
    )
  }
}
export default TicketFilter
