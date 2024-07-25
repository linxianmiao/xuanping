import React, { Component } from 'react'
import KeyValue from '../keyValue/index'
import { Form, Row, Col, Button } from '@uyun/components'
import LazySelect from '~/components/lazyLoad/lazySelect'
const FormItem = Form.Item

class Ticket extends Component {
  constructor (props) {
    super(props)
    this.state = {
      datas: props.trigger.executeParamPos || [{ code: '', value: '' }],
      itemviews: []
    }
  }

  componentDidMount () {
    if (this.props.trigger.executeParamPos) {
      const codes = this.props.trigger.executeParamPos.map(param => param.code)
      const data = {
        codes: codes.join(',')
      }
      axios.get(API.queryFieldDetailsByCodes, { params: data }).then(data => {
        this.setState({
          itemviews: data
        })
      })
    }
  }

  onChangeCondition = (index, value, type = 'value') => {
    const { datas, itemviews } = this.state
    datas[index][type] = value
    if (type === 'code') {
      datas[index].value = ''
      value && axios.get(API.queryFieldDetailsByCodes, { params: { codes: value } }).then(data => {
        this.setState({
          itemviews: [...itemviews, ...data]
        })
      })
    }
    this.setState({
      datas
    })
    this.props.setTriggerData(this.props.triggerIndex, index, datas, true)
  }

  add = () => {
    const { datas } = this.state
    datas.push({ code: '', value: '' })
    this.setState({ datas })
    this.props.setTriggerData(this.props.triggerIndex, 1, datas, true)
  }

  delKeyValue = index => {
    const { datas } = this.state
    datas.splice(index, 1)
    this.setState({ datas })
    this.props.setTriggerData(this.props.triggerIndex, 1, datas, true)
  }

  getList (query, callback) {
    const { pageNo, pageSize, kw } = query
    axios.get(API.listTicketParamFields, { params: { pageNo, pageSize, wd: kw } }).then(res => {
      const list = _.forEach(res.list, item => { item.id = item.code })
      callback(list)
    })
  }

  render () {
    const { formItemLayout, trigger, userList, departList, fieldUsers, variableUsers, triggerNode, store } = this.props
    const { datas, itemviews } = this.state
    return (
      <FormItem {...formItemLayout} label={trigger.name}>
        {
          datas.map((data, index) => {
            const node = itemviews.find(ticket => ticket.code === data.code) || {}
            return (
              <Row key={index} className="left-select">
                <Col span={6}>
                  <LazySelect
                    value={!_.isEmpty(node) ? node.name : data.code ? data.code + '' : null}
                    labelInValue={false}
                    onChange={value => {
                      this.onChangeCondition(index, value, 'code')
                    }}
                    showTip={true}
                    getList={this.getList}
                    placeholder={i18n('ticket.forms.select', '请选择')} />
                </Col>
                <Col span={17} style={{ padding: '0 8px' }}>
                  <KeyValue
                    index={index}
                    value={data.value}
                    node={node}
                    store={store}
                    triggerNode={triggerNode}
                    userList={userList}
                    departList={departList}
                    onHandleChange={this.onChangeCondition}
                    fieldUsers={fieldUsers}
                    variableUsers={variableUsers}
                  />
                </Col>
                <Col span={1}>
                  <i className="iconfont icon-shanchu" onClick={() => { this.delKeyValue(index) }} />
                </Col>
              </Row>
            )
          })
        }
        <Button type="primary" onClick={this.add}>{i18n('add_options', '添加选项')}</Button>
      </FormItem>
    )
  }
}

export default Ticket
