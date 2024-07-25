import React, { Component } from 'react'
import { observer } from 'mobx-react'
import UserPickerModal from './userPickerModal'
import { ArrayToObject, ObjectToArray } from './config'
import { inject } from '@uyun/core'
import { UserPickStore } from '../../userpicker.store'

@observer
class UserPick extends Component {
  @inject(UserPickStore) store

  static defaultProps = {
    onChange: () => {},
    selectionType: 'checkbox',
    tabs: [0, 1, 2, 3, 4, 5],
    size: 'default'
  }

  state = {
    value: { all: [] }
  }

  componentDidMount() {
    this.initValue(this.props)
  }

  static getDerivedStateFromProps(nextProps) {
    return {
      props: nextProps
    }
  }

  componentDidUpdate(prevProps) {
    /**
     * 部分老数据仅存了id，需要根据id获取详情
     * 所以当上一个props和当前的props的value不同为获取的时机
     * 用当前的 props的value来进行数据的初始化
     */
    if (!_.isEqual(prevProps.value, this.state.props.value)) {
      this.initValue(this.state.props)
    }
  }

  initValue = async (props) => {
    // 判断value是不是仅id，如果仅id则需要通过请求获取名称,一般上仅id的仅有一种类型，可以用tab进行区分

    const { value: valueInProps = [], tabs } = this.props
    let list = [...valueInProps]

    const isString = _.some(list, (item) => typeof item === 'string')
    if (isString && tabs.length === 1) {
      switch (tabs[0]) {
        case 0:
          list = await this.store.getGroupList(list, tabs[0])
          break
        case 1:
          list = await this.store.getUserList(list, tabs[0])
          break
        case 2:
          list = await this.store.getDepartList(list, tabs[0])
          break
        default:
          break
      }
    }
    this.setState({
      value: ArrayToObject(list)
    })
  }

  /**
   * 调用父组件的onchange更新数据
   * 但是itsm老数据用的是数组，平台提供的组件时对象，需要将其转化
   */
  onChange = (obj, useVariable) => {
    this.setState({ value: obj })
    // isString 父组件需要的数据格式
    if (this.props.isString) {
      this.props.onChange(
        _.map(ObjectToArray(obj), (item) => item.id),
        useVariable
      )
    } else {
      this.props.onChange(ObjectToArray(obj), useVariable)
    }
  }

  render() {
    const { value } = this.state

    // prosp传递下来的value已经转为state的value，为了避免歧义，在此过滤掉
    const { value: _, onChange, useVariable, ...props } = this.props
    return (
      <UserPickerModal
        {...this.props}
        value={value}
        useVariable={useVariable}
        onChange={this.onChange}
      />
    )
  }
}

export default UserPick
