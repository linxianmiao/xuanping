import React, { Component, createRef } from 'react'
import { PlusOutlined } from '@uyun/icons'
import { Tag, Button, Modal, Dropdown, Menu, Tooltip } from '@uyun/components'
import { checkRules } from './config'
import StrategyForm from './StrategyForm'
import uuid from '~/utils/uuid'
import styles from './strategy.module.less'

export default class extends Component {
  constructor(props) {
    super(props)
    this.modalRef = createRef()
    this.state = {
      visible: '',
      strategy: null,
      fields: [],
      isError: false
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { columns } = this.props
    const { fields } = this.state
    const prevCodes = this.getCodes(columns)
    const codes = _.chain(fields)
      .map((item) => item.code)
      .value()
    // 弹框的时候判断下拉的code，如果定义列进行了改变，重新请求
    if (prevState.visible !== this.state.visible && _.difference(prevCodes, codes).length !== 0) {
      this.queryFields(prevCodes)
    }
  }

  getCodes = (columns) =>
    _.chain(columns)
      .filter((item) => item.type === 'listSel')
      .map((item) => item.source)
      .compact()
      .value()

  queryFields = async (codes) => {
    if (_.isEmpty(codes)) {
      return
    }

    const res = await axios.post(
      API.findFieldByCodeList,
      { fieldCodes: codes },
      { params: { modelId: this.props.modelId } }
    )
    // compact 过滤空的     原因：表格引用的字段不会统计，用户可以删除，后端就会返回null
    this.setState({ fields: _.compact(res) })
  }

  handleMenuClick = (e) => {
    this.setState({
      visible: e.key,
      isError: false
    })
  }

  onDel = (index) => {
    this.props.onChange(_.filter(this.props.value, (_, idx) => idx !== index))
  }

  handleClickTag = (item) => {
    this.setState({
      visible: item.type,
      isError: false,
      strategy: item
    })
  }

  onOk = () => {
    this.modalRef.current.props.form.validateFieldsAndScroll((errors, values) => {
      if (errors) return false
      const { visible, strategy } = this.state
      const rules = _.get(values, 'rules')
      const isError = checkRules(rules, visible)

      if (isError) {
        this.setState({ isError: true })
        return false
      }

      const { value = [] } = this.props
      const strategyId = _.get(strategy, 'id')
      const data = { ..._.omit(values, 'rules'), [`${visible}Rules`]: rules, type: visible }
      if (strategyId) {
        this.props.onChange(
          _.map(value, (item) => (item.id === strategyId ? _.assign({}, item, data) : item))
        )
      } else {
        this.props.onChange([...value, { ...data, id: uuid() }])
      }
      this.setState({ visible: null, strategy: null })
    })
  }

  onCancel = () => {
    this.setState({ visible: null, strategy: null })
  }

  getName = (type) => {
    switch (type) {
      case 'const':
        return i18n('field-table-strategy-const', '常量关联')
      case 'api':
        return i18n('field-table-strategy-api', 'API关联')
      case 'hide':
        return i18n('field-table-strategy-hide', '隐藏关联')
      default:
        return null
    }
  }

  render() {
    const { value: list, columns } = this.props
    const { visible, strategy, fields, isError } = this.state
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 18 }
    }
    const menu = (
      <Menu onClick={this.handleMenuClick}>
        <Menu.Item key="const">{this.getName('const')}</Menu.Item>
        <Menu.Item key="api">{this.getName('api')}</Menu.Item>
        <Menu.Item key="hide">{this.getName('hide')}</Menu.Item>
      </Menu>
    )
    return (
      <div className={styles.strategy}>
        {!_.isEmpty(columns) && (
          <Dropdown overlay={menu}>
            <Button type="primary" style={{ width: 110 }}>
              <PlusOutlined />
              {i18n('field-table-strategy-add', '关联策略')}
            </Button>
          </Dropdown>
        )}
        <div className={styles.strategyList}>
          {_.map(list, (item, index) => {
            return (
              <Tooltip key={item.id}>
                <Tag
                  closable
                  onClick={() => {
                    this.handleClickTag(item)
                  }}
                  onClose={(e) => {
                    e.stopPropagation()
                    this.onDel(index)
                  }}
                >
                  {item.name}
                </Tag>
              </Tooltip>
            )
          })}
        </div>
        <Modal
          title={i18n('trigger.actions.configTicket.set', '设置') + this.getName(visible)}
          size="large"
          destroyOnClose
          visible={Boolean(visible)}
          onOk={this.onOk}
          onCancel={this.onCancel}
        >
          <StrategyForm
            strategy={strategy}
            isError={isError}
            columns={columns}
            visible={visible}
            fields={fields}
            strategyList={list}
            formItemLayout={formItemLayout}
            wrappedComponentRef={this.modalRef}
          />
        </Modal>
      </div>
    )
  }
}
