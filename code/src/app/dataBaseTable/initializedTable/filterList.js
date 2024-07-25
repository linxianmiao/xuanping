import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { Form, Col } from '@uyun/components'
import { DownOutlined } from '@uyun/icons'
// import list from './config/defaultList'
import ItsmSelect from '~/list/form/select'
import ListSel from '~/list/form/listSel'
import ItsmUser from '~/list/form/users'
import ItsmInput from '~/list/form/input'
import Department from '~/list/form/department'
import Group from '~/list/form/group'
import '../style/head.less'
import classnames from 'classnames'
import _ from 'lodash'

// @inject('listStore', 'globalStore', 'modelListStore')
// @withRouter
@observer
class FilterList extends Component {
  state = {
    filterItem: []
  }
  switchType = (item, dilver) => {
    switch (item.type) {
      case 'multiRowText':
      case 'singleRowText':
      case 'int':
      case 'double':
      case 'flowNo':
        return <ItsmInput {...dilver} />
      case 'select':
      case 'business':
      case 'singleSel':
      case 'multiSel':
        return <ItsmSelect {...dilver} />
      case 'listSel':
        return <ListSel {...dilver} />
      case 'user':
        return <ItsmUser {...dilver} />
      case 'userGroup':
      case 'group':
        return <Group {...dilver} />
      case 'department':
        return <Department {...dilver} />
      default:
        return null
    }
  }

  render() {
    const formItemLayout = {
      labelCol: { span: 0 },
      wrapperCol: { span: 20 }
    }

    const { getFieldValue, setFieldsValue, getFieldDecorator } = this.props.form

    const { searchList, handleChange, showIcon, isShow = false } = this.props

    let formDom = []

    _.forEach(_.cloneDeep(searchList), (item, index) => {
      const defaultValue = undefined
      const field = { ...item, ...item.params }
      if (field.type === 'listSel') {
        field.formData = JSON.parse(field.formData)
        field.headers = JSON.parse(field.headers)
        field.raw = JSON.parse(field.raw)
        field.params = JSON.parse(field.params)
      }
      const dilver = {
        //   size: 'small',
        item: field,
        defaultValue,
        formItemLayout,
        getFieldValue,
        setFieldsValue,
        getFieldDecorator,
        disabled: false,
        handleChange: handleChange,
        noLabel: true
        //   getPopupContainer: () => document.getElementById('ticket-list-filter-warp')
      }
      // if (index && index % 3 === 0) {
      //   formDom.push(<Col key={index} span={24} style={{ height: '1px' }} />)
      // }
      formDom.push(
        <Col className="filter-item" key={item.code} span={6}>
          {this.switchType(item, dilver)}
        </Col>
      )
    })
    if (showIcon) {
      formDom.push(
        <Col key={'icon'} span={6}>
          <div
            onClick={this.props.onClickMore}
            className={classnames('filter-icon', {
              active: isShow
            })}
          >
            更多筛选
            {'  '}
            <DownOutlined />
          </div>
        </Col>
      )
    }
    return <Form className={this.props?.className}>{formDom}</Form>
  }
}

export default Form.create()(FilterList)
