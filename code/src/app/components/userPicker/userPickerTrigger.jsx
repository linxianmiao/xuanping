import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import UserPickerTable from './userPickerTable'
import { PlusOutlined } from '@uyun/icons'
import { Select, Divider, Modal } from '@uyun/components'
import ErrorBoundary from '~/components/ErrorBoundary'
import { StoreProvider } from './config'
const Option = Select.Option
const actions = [
  {
    id: 'prevHandler',
    name: i18n('config.trigger.preHandler0', '上一阶段处理人')
  },
  {
    id: 'resolvor',
    name: i18n('config.trigger.resolvor', '处理人')
  },
  {
    id: 'creator',
    name: i18n('config.trigger.creator', '创建人')
  },
  {
    id: 'follower',
    name: i18n('config.trigger.follower', '关注人')
  }
]
@inject('userPickStore')
@observer
export default class UserPickerTrigger extends Component {
  static defaultProps = {
    onChange: () => {}
  }

  actionIds = _.map(actions, (item) => item.id)

  state = {
    visible: false,
    modalValue: {},
    value: []
  }

  async componentDidMount() {
    let res = []
    const userIds = _.differenceWith(this.props.value, actions, (pre, next) => {
      if (pre !== next.value) {
        return false
      }
    })
    if (userIds) {
      res = await this.props.userPickStore.getUserList(userIds, 1)
    }
    const value = [..._.filter(actions, (item) => _.includes(this.props.value, item.id)), ...res]
    this.setState({
      value
    })
  }

  // 点击选择框，初始化modal弹框里的数据
  onDropdownVisibleChange = (visible) => {
    const users = _.chain(this.state.value)
      .filter((item) => !_.includes(this.actionIds, item.id))
      .value()
    this.setState({
      visible,
      modalValue: {
        users: users
      }
    })
  }

  onOk = () => {
    const { modalValue } = this.state
    const list = modalValue.all || []
    const value = [
      ..._.chain(this.state.value)
        .filter((item) => _.includes(this.actionIds, item.id))
        .value(),
      ...list
    ]
    this.setState({
      visible: false,
      value: value
    })
    this.props.onChange(_.map(value, (item) => item.id))
  }

  onCancel = () => {
    this.setState({ visible: false })
  }

  onChange = (value) => {
    this.setState({
      value: value.map((item) => ({ id: item.key, name: item.label }))
    })
    this.props.onChange(_.map(value, (item) => item.key))
  }

  onChangeModalValue = (modalValue) => {
    this.setState({ modalValue })
  }

  render() {
    const { value, modalValue, visible } = this.state
    return (
      <StoreProvider value={{ props: { tabs: [1] } }}>
        <React.Fragment>
          <Select
            value={_.map(value, (item) => ({ key: item.id, label: item.name }))}
            labelInValue
            mode="multiple"
            onChange={this.onChange}
            dropdownRender={(menu) => (
              <div>
                {menu}
                <Divider style={{ margin: '4px 0' }} />
                <div
                  onMouseDown={() => {
                    this.onDropdownVisibleChange(true)
                  }}
                  style={{ padding: '8px', cursor: 'pointer' }}
                >
                  <PlusOutlined /> Add item
                </div>
              </div>
            )}
          >
            {_.map(actions, (item) => (
              <Option key={item.id}>{item.name}</Option>
            ))}
          </Select>
          <Modal
            title="人员选择"
            size="large"
            visible={visible}
            onOk={this.onOk}
            onCancel={this.onCancel}
          >
            <ErrorBoundary desc={i18n('loadFail', '加载失败')}>
              <UserPickerTable value={modalValue} onChange={this.onChangeModalValue} />
            </ErrorBoundary>
          </Modal>
        </React.Fragment>
      </StoreProvider>
    )
  }
}
