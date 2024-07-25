import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import SecondaryCommonConfig from '../config/secondaryCommonConfig'
import {
  FieldLayouts,
  Input,
  Select,
  InputNumber,
  Params,
  ItsmRadio,
  ItsmCheckbox,
  Cascader,
  ItsmPwd,
  ItsmCheckboxGroup,
  Resource,
  UseScene,
  AttributeColumns,
  Users,
  RadioButton,
  TimeInterval,
  ExcelImport,
  LinkUrl
} from '../form'

@withRouter
class Common extends Component {
  _render = (item) => {
    const {
      formItemLayout,
      getFieldDecorator,
      getFieldValue,
      setFieldsValue,
      store,
      modelId,
      fieldCode,
      source = ''
    } = this.props
    const { type, fieldData, layouts } = this.props.store
    const diliver = {
      store,
      source,
      modelId,
      fieldCode,
      type,
      fieldData,
      formItemLayout,
      item,
      getFieldDecorator,
      setFieldsValue,
      getFieldValue,
      TreeOrcascader: this.props.TreeOrcascader,
      defaultValue:
        fieldData && fieldData[item.code] != null
          ? fieldData[item.code]
          : item.defaultValue || undefined
    }
    // 跨域字段屏蔽分组
    if (fieldData.sharedBusinessUnitName && item.code === 'layoutId') {
      return false
    }
    switch (item.type) {
      case 'input':
      case 'textarea':
        return <Input type={item.type} key={`${type}${item.code}`} {...diliver} />
      case 'select':
        return <Select key={`${type}${item.code}`} {...diliver} />
      case 'inputNumber':
        return <InputNumber key={`${type}${item.code}`} {...diliver} />
      case 'radio':
        return <ItsmRadio key={`${type}${item.code}`} {...diliver} />
      case 'checkbox':
        return <ItsmCheckbox key={`${type}${item.code}`} {...diliver} />
      case 'params':
        return <Params key={`${type}${item.code}`} {...diliver} />
      case 'fieldLayouts':
        return <FieldLayouts key={`${type}${item.code}`} layouts={layouts} {...diliver} />
      case 'cascader':
      case 'treeSel':
        return (
          <Cascader type={this.props.type || item.type} key={`${type}${item.code}`} {...diliver} />
        )
      case 'pwd':
        return <ItsmPwd key={`${type}${item.code}`} {...diliver} />
      case 'checkboxGroup':
        return <ItsmCheckboxGroup key={`${type}${item.code}`} {...diliver} />
      case 'resource':
        return <Resource key={`${type}${item.code}`} {...diliver} />
      case 'useScene':
        return <UseScene key={`${type}${item.code}`} {...diliver} />
      case 'attributeValues':
        return <AttributeColumns key={`${type}${item.code}`} {...diliver} />
      case 'user':
        return <Users key={`${type}${item.code}`} {...diliver} />
      case 'radioButton':
        return <RadioButton key={`${type}${item.code}`} {...diliver} />
      case 'timeInterval':
        return <TimeInterval key={`${type}${item.code}`} {...diliver} />
      case 'excelImport':
        return <ExcelImport key={`${type}${item.code}`} {...diliver} />
      case 'linkUrl':
        return <LinkUrl key={`${type}${item.code}`} {...diliver} />
      default:
        return null
    }
  }

  renderConfig = () => {
    // 过滤掉非法的child，包括但不限于 false、字符串
    const children = [].concat(this.props.children).filter((child) => React.isValidElement(child))
    const getSortKey = (item) => (React.isValidElement(item) ? item.props.sortKey : item.sortKey)

    // 排序：都有sortKey的按sortKey来；都没有sortKey的保持原状；一个有一个没有的，没有sortKey的优先级更高
    return this.props.config
      .concat(children)
      .sort((a, b) => {
        const aKey = getSortKey(a)
        const bKey = getSortKey(b)
        const aIsNumber = typeof aKey === 'number'
        const bIsNumber = typeof bKey === 'number'
        if (aIsNumber && bIsNumber) return aKey - bKey
        if (!aIsNumber && !bIsNumber) return 0
        if (!aIsNumber && bIsNumber) return -1
        if (aIsNumber && !bIsNumber) return 1
      })
      .map((item) => (React.isValidElement(item) ? item : this._render(item)))
  }

  render() {
    let SecondaryCommonConfigList = _.cloneDeep(SecondaryCommonConfig)
    if (this.props?.source === 'dataBase') {
      SecondaryCommonConfigList = _.filter(
        SecondaryCommonConfigList,
        (item) => item.code === 'fieldDesc'
      )
    }
    return (
      <div id="create-file-field">
        {this.renderConfig()}

        {SecondaryCommonConfigList.map((item) => this._render(item))}
      </div>
    )
  }
}

export default Common
