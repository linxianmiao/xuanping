import React, { Component } from 'react'
import { Modal, Checkbox, message } from '@uyun/components'
import { observer, inject } from 'mobx-react'
import Basic from './basic'
@inject('listStore', 'queryerStore')
@observer
class typeModal extends Component {
  componentDidMount() {
    this.props.listStore.getMenuGroup()
  }

  onSubmit = () => {
    this.basic.props.form.validateFieldsAndScroll(async (errors, values) => {
      if (errors) return false
      const newData = _.assign(values, {
        menuType: 'GROUP'
      })
      const res = await this.props.listStore.saveMenuList(newData)
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
      this.props.listStore.setCheckFilterList(_.filter(checkFilterList, (item) => item !== value))
    }
  }

  // 添加筛选项列表
  _renderContent = () => {
    const { allField, checkFilterList } = this.props.listStore
    const { builtinFields = [], extendedFields = [] } = allField
    return (
      <div className="queryer-expansion-filter-list-wrap">
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

  render() {
    const { visible, onCancel, editData } = this.props
    const name = window.language === 'en_US' ? editData.enName : editData.zhName
    return (
      <Modal
        title={name || i18n('system.queryer.addType', '添加分类')}
        visible={visible}
        onOk={this.onSubmit}
        onCancel={onCancel}
        width={560}
        className="queryer-filter-wrap"
      >
        <div className="query_form_type_wrap">
          <Basic
            wrappedComponentRef={(node) => {
              this.basic = node
            }}
            menuType="GROUP"
            editData={editData}
            appIsolation={this.props.appIsolation}
          />
        </div>
      </Modal>
    )
  }
}
export default typeModal
