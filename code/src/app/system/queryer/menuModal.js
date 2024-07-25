import React, { Component, Fragment } from 'react'
import {
  Modal,
  Title,
  Checkbox,
  Button,
  message,
  Radio,
  Input,
  Form,
  Popover
} from '@uyun/components'
import FilterList from './filterList'
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'
import list from './config/defaultList'
import Basic from './basic'
import CustomColumn from './customColumn'
import moment from 'moment'
import { defaultFilter, disabledFilter } from './config/filter'
import FilterFields from '~/components/filterFields'
import AttrFieldPanelModal from '~/components/AttrFieldPanel'
import ModelSelect from '~/list/components/modelLazySelect'
import _ from 'lodash'
const FormItem = Form.Item

@inject('listStore', 'queryerStore', 'globalStore')
@observer
class MenuModal extends Component {
  constructor(props) {
    super(props)
    const { queryMenuView, menuType, queryArchived } = this.props.editData
    this.state = {
      menuType: menuType || 'QUERYER',
      openMode: _.get(queryMenuView, 'openMode', 'embedLoding'),
      linkUrl: _.get(queryMenuView, 'linkUrl', ''),
      lockCondition: _.get(queryMenuView, 'lockCondition', []),
      orderField: _.get(queryMenuView, 'orderField') || 'updateTime', // 查询器默认排序,
      modelIds: _.get(queryMenuView, 'model_id') || [],
      queryArchived: queryArchived || 0
    }
  }

  componentDidMount() {
    this.props.listStore.getMenuGroup()
  }

  onSubmit = () => {
    const { attributeList, checkFilterList, querySelectedList, columnSelectedList, columnsWidth } =
      toJS(this.props.listStore)
    const { menuType, linkUrl, openMode, lockCondition, orderField, modelIds, queryArchived } =
      this.state
    let QuerySelectedList = _.cloneDeep(toJS(querySelectedList))
    QuerySelectedList = _.map(QuerySelectedList, (item) => {
      if (item?.outsideUrl) {
        item.params = []
      }
      return item
    })
    let ColumnSelectedList = _.cloneDeep(toJS(columnSelectedList))
    ColumnSelectedList = _.map(ColumnSelectedList, (item) => {
      if (item?.outsideUrl) {
        item.params = []
      }
      return item
    })

    this.Basic.props.form.validateFieldsAndScroll(async (errors, values) => {
      if (errors) return false
      let submitData = {}
      if (menuType !== 'HYPERLINK' && menuType !== 'BUILT') {
        if (_.isEmpty(checkFilterList)) {
          message.error(i18n('menuModal.tip1', '查询条件必须选择一个'))
          return false
        }
        if (_.isEmpty(attributeList)) {
          message.error('定制列至少保留一项')
          return false
        }
        const { editData } = this.props
        const { queryMenuView = {} } = editData
        const { extParams = {} } = queryMenuView
        const filterListData = this.filterList.props.form.getFieldsValue()
        _.forEach(filterListData, (val, key) => {
          if (val instanceof Array && moment.isMoment(val[0])) {
            filterListData[key] = [
              moment(val[0]).format('YYYY-MM-DD'),
              moment(val[1]).format('YYYY-MM-DD')
            ]
          } else {
            filterListData[key] = queryMenuView[key] || extParams[key] || null
          }
        })
        const defaultfields = _.pick(filterListData, defaultFilter) // 默认的筛选放放queryMenuView
        const newfields = _.omit(filterListData, defaultFilter) // 非默认的放extParams
        submitData = _.assign(values, {
          menuType,
          queryArchived: this.state.queryArchived,
          queryMenuView: {
            ...defaultfields,
            lockCondition: lockCondition,
            checkFilterList,
            orderField,
            extParams: {
              ...newfields,
              columns: attributeList
            },
            model_id: modelIds,
            querySelectedList: QuerySelectedList,
            columnSelectedList: ColumnSelectedList,
            selectedColumnsWidth: columnsWidth
          }
        })
      } else {
        if (menuType !== 'BUILT' && _.isEmpty(linkUrl)) {
          message.error(i18n('menuModal.tip2', '请输入URL'))
          return false
        }
        if (menuType === 'BUILT') {
          // 拿到什么菜单数据，修改后，就给服务端什么数据
          // 扁平化菜单数据，方便匹配出当前内置菜单
          let menus = []
          toJS(this.props.queryerStore.listData).forEach((item) => {
            if (item.menuType === 'GROUP') {
              menus = menus.concat(item.children)
            } else {
              menus = menus.concat(item)
            }
          })
          const menu = menus.find((item) => item.id === values.id) || {}
          // 内置查询器也支持编辑列
          if (menu.queryMenuView) {
            menu.queryMenuView.extParams.columns = attributeList
            menu.queryMenuView.orderField = orderField
            menu.queryMenuView.querySelectedList = QuerySelectedList
            menu.queryMenuView.columnSelectedList = ColumnSelectedList
            menu.queryMenuView.model_id = modelIds
            menu.queryMenuView.selectedColumnsWidth = columnsWidth
          }
          submitData = { ...menu, ...values }
        } else {
          submitData = _.assign(values, {
            menuType,
            queryMenuView: {
              linkUrl,
              openMode,
              selectedColumnsWidth: columnsWidth
            }
          })
        }
      }
      const res = await this.props.listStore.saveMenuList(submitData)
      if (+res === 200) {
        this.props.queryerStore.getMenuList()
        const tip = values.id
          ? i18n('ticket.kb.edit.success', '编辑成功')
          : i18n('ticket.kb.success', '创建成功')
        message.success(tip)
        this.props.onCancel()
      }
    })
  }

  handleChange = (e) => {
    const { value, checked } = e.target
    const { checkFilterList } = this.props.listStore
    if (checked) {
      this.props.listStore.setCheckFilterList([...checkFilterList, value])
    } else {
      if (checkFilterList.length < 2) {
        message.info(i18n('queryer.filter.info', '筛选项至少保留一项'))
      } else {
        this.props.listStore.setCheckFilterList(_.filter(checkFilterList, (item) => item !== value))
      }
    }
  }

  changeMenuType = (e) => {
    this.setState({
      menuType: e.target.value
    })
  }

  changeUrl = (e) => {
    this.setState({
      linkUrl: e.target.value
    })
  }

  changeOpenMode = (e) => {
    this.setState({
      openMode: e.target.value
    })
  }

  // 添加筛选项列表
  _renderContent = () => {
    const { allField, checkFilterList } = this.props.listStore
    const { builtinFields = [], extendedFields = [] } = allField
    return (
      <div className="queryer-expansion-filter-list-wrap">
        <div className="classification-filter-wrap">
          <h3>{i18n('default_field', '普通字段')}</h3>
          <div className="list-wrap">
            {_.map(this.list, (item) => {
              return (
                <div key={item.code}>
                  <Checkbox
                    value={item.code}
                    checked={_.includes(checkFilterList, item.code)}
                    onChange={this.handleChange}
                  >
                    <span title={item.name} className="shenglue">
                      {item.name}
                    </span>
                  </Checkbox>
                </div>
              )
            })}
          </div>
        </div>
        <div className="classification-filter-wrap">
          <h3>{i18n('builtin_field', '内置字段')}</h3>
          <div className="list-wrap">
            {_.map(builtinFields, (item) => {
              return (
                <div key={item.code}>
                  <Checkbox
                    value={item.code}
                    checked={_.includes(checkFilterList, item.code)}
                    onChange={this.handleChange}
                  >
                    <span title={item.name} className="shenglue">
                      {item.name}
                    </span>
                  </Checkbox>
                </div>
              )
            })}
          </div>
        </div>
        {!_.isEmpty(extendedFields) && (
          <div className="classification-filter-wrap">
            <h3>{i18n('expansion_field', '扩展字段')}</h3>
            <div className="list-wrap">
              {_.map(extendedFields, (item) => {
                return (
                  <div key={item.code}>
                    <Checkbox
                      value={item.code}
                      checked={_.includes(checkFilterList, item.code)}
                      onChange={this.handleChange}
                    >
                      <span title={item.name} className="shenglue">
                        {item.name}
                      </span>
                    </Checkbox>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  handleClick = (key) => {
    const { linkUrl } = this.state
    this.setState({
      linkUrl: `${linkUrl}${key}`
    })
  }

  changeLockCondition = (item) => {
    const { lockCondition } = this.state
    if (lockCondition.indexOf(item.code) === -1) {
      lockCondition.push(item.code)
    } else {
      _.pull(lockCondition, item.code)
    }
    this.setState({
      lockCondition
    })
  }

  changeEditData = _.debounce((editData) => {
    this.props.changeEditData(editData)
  }, 300)

  onValuesChange = (props, changedValues, allValues) => {
    const { editData, listStore } = this.props
    const { querySelectedList, setSelectedList } = listStore
    const valueKey = _.keys(changedValues)[0]
    let modelId = ''
    let code = ''
    if (valueKey) {
      modelId = valueKey.split('_')[0]
      code = valueKey.split('_')[1]
    }
    const queryValue = querySelectedList.map((item) => {
      if (item.modelId === modelId && item.code === code) {
        item.value = changedValues[valueKey]
      }
      if (item.code === valueKey) {
        item.value = changedValues[valueKey]
      }
      return { ...item }
    })
    listStore.setSelectedList(queryValue, 'QUERY')
    // const queryMenuView = _.get(editData, 'queryMenuView', {})
    // const extParams = queryMenuView.extParams || {}
    // _.map(Object.keys(changedValues), item => {
    //   if (defaultFilter.indexOf(item) > -1) {
    //     queryMenuView[item] = changedValues[item]
    //   } else {
    //     extParams[item] = changedValues[item]
    //     queryMenuView.extParams = extParams
    //   }
    // })
    // editData.queryMenuView = queryMenuView
    // this.changeEditData(editData)
  }

  setProps = (obj) => {
    this.setState(obj)
  }

  handleChangeAttrField = (value) => {
    const valueCode = value.map((item) => item.code)
    if (valueCode.length === 0) {
      message.info(i18n('queryer.filter.info', '筛选项至少保留一项'))
      return
    }
    this.props.listStore.setSelectedList(value, 'QUERY')
    this.props.listStore.setCheckFilterList(valueCode)
  }

  changeAchived = (e) => {
    this.setState({ queryArchived: e.target.value })
  }

  render() {
    const { visible, onCancel, editData } = this.props
    const { menuType, openMode, linkUrl, lockCondition, orderField, modelIds, queryArchived } =
      this.state
    const {
      allField,
      checkFilterList: checkedList,
      queryAttrList,
      querySelectedList
    } = this.props.listStore
    const { builtinFields = [], extendedFields = [] } = allField
    const newExtendedFields = _.map(extendedFields, (field) =>
      _.assign({}, field, { disabled: disabledFilter.indexOf(field.type) > -1 })
    )
    const name = window.language === 'en_US' ? editData.enName : editData.zhName
    const formItemLayout = { labelCol: { span: 2 }, wrapperCol: { span: 12 } }
    const content = (
      <div className="popover-content">
        <ul className="clearfix">
          <li
            key={'realname'}
            onClick={() => {
              this.handleClick('${ticket.user.name}')
            }}
          >
            {i18n('current.user.userName', '当前用户用户名')}
          </li>
          <li
            key={'userId'}
            onClick={() => {
              this.handleClick('${ticket.user.id}')
            }}
          >
            {i18n('current.user.userId', '当前用户ID')}
          </li>
          <li
            key={'token'}
            onClick={() => {
              this.handleClick('${ticket.token}')
            }}
          >
            {i18n('current.user.token', '当前用户token')}
          </li>
        </ul>
      </div>
    )
    return (
      <Modal
        getContainer={() => document.getElementById('queryer_wrap')}
        title={name || i18n('system.queryer.addMenu', '添加查询器')}
        visible={visible}
        onOk={this.onSubmit}
        onCancel={onCancel}
        width={1000}
        className="queryer-filter-wrap"
      >
        <Title>{i18n('conf.model.basicInfo', '基本信息')}</Title>
        <div className="query_form_filter_wrap">
          <Basic
            wrappedComponentRef={(node) => {
              this.Basic = node
            }}
            menuType={menuType}
            editData={editData || {}}
            appIsolation={this.props.appIsolation}
          />
        </div>
        {menuType !== 'BUILT' && (
          <Fragment>
            <Title>{i18n('view_settings', '视图设置')}</Title>
            <Radio.Group onChange={this.changeMenuType} value={menuType} buttonStyle="solid">
              <Radio.Button value="QUERYER">{i18n('view_settings_itsm', 'ITSM列表')}</Radio.Button>
              <Radio.Button value="HYPERLINK">
                {i18n('view_settings_url', '第三方URL')}
              </Radio.Button>
            </Radio.Group>
          </Fragment>
        )}
        <div>
          {menuType !== 'HYPERLINK' &&
          editData.code !== 'overview' &&
          editData.code !== 'draft_box' ? (
            <div style={{ margin: '15px 15px' }}>
              <div style={{ marginBottom: 20 }}>{'模型属性'}</div>
              <ModelSelect
                onChange={(value) => this.setState({ modelIds: value })}
                mode="multiple"
                value={modelIds}
                getPopupContainer={(triggerNode) => triggerNode}
              />
            </div>
          ) : null}
        </div>
        <div>
          {menuType !== 'HYPERLINK' && menuType !== 'BUILT' && (
            <div style={{ margin: '15px 15px' }}>
              <div style={{ marginBottom: 20 }}>{'查询范围'}</div>
              <Radio.Group value={queryArchived} onChange={this.changeAchived}>
                <Radio value={0}>未归档</Radio>
                <Radio value={1}>已归档</Radio>
              </Radio.Group>
            </div>
          )}
        </div>
        {menuType !== 'HYPERLINK' && menuType !== 'BUILT' && (
          <Fragment>
            <div className="sub_title_wrap">{i18n('conf.model.queryCondition', '查询条件')}</div>
            <div id="query_form_filter_wrap" className="query_form_filter_wrap">
              <FilterList
                editData={editData}
                lockCondition={lockCondition}
                onValuesChange={this.onValuesChange}
                changeLockCondition={this.changeLockCondition}
                wrappedComponentRef={(node) => {
                  this.filterList = node
                }}
              />
              <AttrFieldPanelModal
                title="自定义条件"
                attrList={toJS(queryAttrList)}
                selected={[...toJS(querySelectedList)]}
                onChange={(value) => this.handleChangeAttrField(value)}
                modelIds={modelIds}
              >
                <Button>{i18n('custom.condition', '自定义条件')}</Button>
              </AttrFieldPanelModal>
            </div>
          </Fragment>
        )}
        {menuType === 'HYPERLINK' && (
          <div id="queryer-filter-wrap">
            <div className="sub_title_wrap">{i18n('http_setting', '链接设置')}</div>
            <div className="query_form_filter_wrap url_wrap">
              <FormItem {...formItemLayout} label="URL" required>
                <div>
                  <Input
                    placeholder="请输入URL"
                    value={linkUrl}
                    onChange={this.changeUrl}
                    style={{ width: '90%', marginRight: '15px' }}
                  />
                  <Popover
                    getPopupContainer={() => document.getElementById('queryer-filter-wrap')}
                    content={content}
                    trigger="click"
                    placement="bottom"
                  >
                    <i className="icon-code iconfont" />
                  </Popover>
                </div>
              </FormItem>

              <FormItem {...formItemLayout} label="打开方式">
                <Radio.Group
                  value={openMode}
                  buttonStyle="solid"
                  onChange={this.changeOpenMode}
                  style={{ display: 'inline-block' }}
                >
                  <Radio.Button value="embedLoding">平台框架</Radio.Button>
                  <Radio.Button value="newTab">新开窗口</Radio.Button>
                </Radio.Group>
                <div
                  className="open_mode_tips"
                  style={{ display: openMode === 'embedLoding' ? 'inline-block' : 'none' }}
                >
                  框架内部展示链接内容
                </div>
              </FormItem>
            </div>
          </div>
        )}
        {menuType !== 'HYPERLINK' &&
          editData.code !== 'overview' &&
          editData.code !== 'draft_box' && (
            <CustomColumn
              orderField={orderField}
              setProps={this.setProps}
              menuCode={editData.code}
              modelIds={modelIds}
            />
          )}
      </Modal>
    )
  }
}
export default MenuModal
