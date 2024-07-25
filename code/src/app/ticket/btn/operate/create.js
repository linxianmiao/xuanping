import React, { Component } from 'react'
import { Form, Row, Col, Select } from '@uyun/components'
import Editor from '../../mention/MentionWithOption'
import User from './user'

const FormItem = Form.Item
const Option = Select.Option

class Create extends Component {
  state = {
    taches: [],
    value: '',
    inputVal: '',
    departs: [],
    isCheck: null,
    currDepart: null
  }

  /**
   * @Author FB
   * 获取各个环节数据，并组合出需要创建人指定执行人的环节
   */
  componentDidMount() {
    const tl = []
    this.props.activitys
      ? _.map(this.props.activitys, (item, index) => {
          // 获取由创建人指定以及第二环节由上一环节指定的环节数据
          // item.index定义的是真实环节顺序，并行环节属于统一环节顺序
          index = item.index || index
          if ((index === 1 && item.policy === 1) || item.policy === 2) {
            tl.push(item)
          }
        })
      : null
    this.setState({ taches: tl })
    // 调 是否 开启 组织机构 的 接口
    // 调 是否 开启 组织机构 的 接口
    axios.get(API.CHECK_ORG).then(data => {
      this.setState({
        departs: data.departs || [],
        isCheck: data.isCheck,
        currDepart: !_.isEmpty(data.departs) ? data.departs[0].id : null
      })
    })
  }

  componentWillUpdate(nextProps) {
    if (nextProps.activitys !== this.props.activitys) {
      const tl = []
      nextProps.activitys
        ? _.map(nextProps.activitys, item => {
            // 获取由创建人指定以及第二环节由上一环节指定的环节数据
            // item.index定义的是真实环节顺序，并行环节属于统一环节顺序
            if ((item.index === 1 && item.policy === 1) || item.policy === 2) {
              tl.push(item)
            }
          })
        : null
      this.setState({ taches: tl })
    }
  }

  handleChange = val => {
    this.setState({
      value: val
    })
    this.props.form.setFieldsValue({ message: val })
  }

  // 开启 组织机构  选择所属部门
  onChangeCheckOrg = val => {
    this.setState(
      {
        currDepart: val
      },
      () => {
        this.props.form.setFieldsValue({ departId: val })
      }
    )
  }

  render() {
    const { getFieldDecorator, setFieldsValue } = this.props.form

    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 18 }
    }
    return (
      <Form className="double-line" layout="vertical">
        {// showDepart（新建需要显示）
        this.props.showDepart && this.state.isCheck && !_.isEmpty(this.state.departs) ? ( // 要开启 组织机构 且 要有部门， 如果开启了 没有部门 也不显示了
          <FormItem label={$.translate('config', 'user', 'domains')} {...formItemLayout}>
            <div className="checkOrg">
              {getFieldDecorator('departId', {
                initialValue: undefined,
                onChange: this.onChangeCheckOrg
              })(
                <Select>
                  {!_.isEmpty(this.state.departs) &&
                    this.state.departs.map(item => {
                      return <Option key={item.id}>{item.name}</Option>
                    })}
                </Select>
              )}
            </div>
          </FormItem>
        ) : null}
        {_.map(this.state.taches, (item, index) => {
          return (
            <div className="check-user-wrap" key={item.tacheId}>
              <Row className="line32">
                <Col span={24} style={{ display: index > 0 ? 'none' : 'block' }}>
                  <label className="ant-form-item-required">
                    {i18n('ticket.operate.Choose_executor', '处理人')}
                  </label>
                </Col>
                <Col span={24} className="user-wrap-col">
                  <div className="tache-name">{item.tacheName}</div>
                  <User
                    item={{
                      code: item.tacheId,
                      type: 'create',
                      name: i18n('ticket.operate.select_jump', '该阶段人员'),
                      isRequired: 1,
                      users: item,
                      showName: false
                    }}
                    getFieldDecorator={getFieldDecorator}
                    setFieldsValue={setFieldsValue}
                    orgId={this.state.currDepart || null} // 开启组织机构时  传 所属部门的id
                    currDepart={this.state.currDepart} // 开启组织机构时 选择部门 改变用户的选择
                    setFlowUser={this.props.setFlowUser}
                  />
                </Col>
              </Row>
            </div>
          )
        })}
        {!this.props.isCreate && (
          <FormItem label={i18n('ticket.detail.opinion', '意见')}>
            {getFieldDecorator('message', {
              initialValue: undefined,
              rules: [
                {
                  min: 0,
                  max: 2000,
                  message: i18n('ticket.create.most_opinion', '处理意见最多2000字')
                }
              ],
              getValueFromEvent: function(data) {
                return data
              }
            })(
              <Editor
                setFieldsValue={setFieldsValue}
                val={this.state.value}
                handleChange={this.handleChange}
              />
            )}
          </FormItem>
        )}
      </Form>
    )
  }
}

export default Form.create()(Create)
